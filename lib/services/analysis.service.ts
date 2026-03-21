import { generateText, generateStream, getActiveProvider } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { projectRepository } from '@/lib/repositories/project.repository';
import { analysisStepRepository } from '@/lib/repositories/analysis-step.repository';
import { getPrompt } from '@/lib/services/prompt.service';
import { ensureStepPrompt } from '@/lib/services/prompt-auto-generator.service';
import { chunkRfpText } from '@/lib/services/rfp-chunker.service';
import { RFP_STEP_DEFINITIONS } from '@/lib/ai/prompts/rfp-steps';
import type { RfpAnalysisResult } from '@/lib/ai/types';
import type { SSEProgress } from '@/lib/utils/sse-stream';

type ProgressCallback = (p: SSEProgress) => void;

// ─── 기존 1회 호출 분석 (레거시 호환) ─────────────────────────

const LEGACY_STEPS = [
  { key: '"overview"', label: '사업 개요 파악', progress: 15 },
  { key: '"evaluationItems"', label: '평가항목 추출 + 배점 검증', progress: 28 },
  { key: '"requirements"', label: '요구사항 도출 (7개 카테고리)', progress: 42 },
  { key: '"traceabilityMatrix"', label: '추적성 매트릭스 생성', progress: 52 },
  { key: '"qualifications"', label: '자격요건/납기/법규 추출', progress: 60 },
  { key: '"strategyPoints"', label: '배점 전략 분석', progress: 68 },
  { key: '"recommendedChapters"', label: '목차 구성 제안', progress: 76 },
  { key: '"scope"', label: '범위 정의', progress: 82 },
  { key: '"constraints"', label: '제약사항 추출', progress: 88 },
  { key: '"keywords"', label: '키워드 추출', progress: 92 },
];

function parseJson<T>(result: string, fallback: T): T {
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
  } catch {
    return fallback;
  }
}

/** 기존 방식: 1회 LLM 호출로 전체 분석 (rfp-analysis 프롬프트) */
export async function runAnalysis(
  projectId: string,
  onProgress?: ProgressCallback,
): Promise<RfpAnalysisResult> {
  const stepLabels = LEGACY_STEPS.map((s) => s.label);
  const totalSteps = LEGACY_STEPS.length;

  await projectRepository.updateStatus(projectId, 'analyzing');
  onProgress?.({ step: 'RFP 텍스트 로딩', progress: 5, steps: stepLabels, totalSteps, stepIndex: -1 });

  const rfpFile = await rfpRepository.getFileByProjectId(projectId);
  if (!rfpFile) throw new Error('RFP 파일이 없습니다');

  onProgress?.({ step: '수주 최적화 AI 분석 시작', progress: 10, stepIndex: -1, totalSteps });

  let accumulated = '';
  let currentStepIdx = -1;

  const prompt = await getPrompt('rfp-analysis');
  const stream = generateStream({
    systemPrompt: prompt.systemPrompt,
    userPrompt: prompt.buildUserPrompt(rfpFile.rawText),
    maxTokens: prompt.maxTokens,
  });

  for await (const chunk of stream) {
    accumulated += chunk;
    for (let i = currentStepIdx + 1; i < LEGACY_STEPS.length; i++) {
      if (accumulated.includes(LEGACY_STEPS[i].key)) {
        currentStepIdx = i;
        onProgress?.({ step: LEGACY_STEPS[i].label, progress: LEGACY_STEPS[i].progress, stepIndex: i, totalSteps });
      } else break;
    }
  }

  onProgress?.({ step: '분석 결과 파싱', progress: 95, stepIndex: totalSteps - 1, totalSteps });

  const analysisData = parseJson<RfpAnalysisResult>(accumulated, {
    overview: { projectName: '분석 실패', summary: accumulated.slice(0, 500) },
    evaluationItems: [], requirements: [], traceabilityMatrix: [],
    qualifications: [], strategyPoints: [], recommendedChapters: [],
    scope: { inScope: [], outOfScope: [] },
    constraints: { technical: [], business: [], timeline: [] },
    keywords: [],
  } as unknown as RfpAnalysisResult);

  onProgress?.({ step: 'DB 저장', progress: 97, stepIndex: totalSteps - 1, totalSteps });

  const evalItems = analysisData.evaluationItems ?? [];
  await rfpRepository.createAnalysis({
    projectId,
    overview: analysisData.overview ?? {},
    requirements: analysisData.requirements ?? [],
    evaluationCriteria: evalItems.map((item) => ({
      category: item.category, item: item.item, score: item.score,
      description: item.criteria ?? item.item,
    })),
    evaluationItems: evalItems,
    traceabilityMatrix: analysisData.traceabilityMatrix ?? [],
    qualifications: analysisData.qualifications ?? [],
    strategyPoints: analysisData.strategyPoints ?? [],
    recommendedChapters: analysisData.recommendedChapters ?? [],
    scope: analysisData.scope ?? { inScope: [], outOfScope: [] },
    constraints: analysisData.constraints ?? { technical: [], business: [], timeline: [] },
    keywords: analysisData.keywords ?? [],
  });

  await projectRepository.updateStatus(projectId, 'direction_set');
  onProgress?.({ step: '완료', progress: 100, stepIndex: totalSteps, totalSteps });
  return analysisData;
}

// ─── 7단계 체이닝 분석 (신규) ──────────────────────────────

/** 특정 단계만 실행 (재실행 포함) */
export async function runAnalysisStep(
  projectId: string,
  stepNumber: number,
  onProgress?: ProgressCallback,
): Promise<Record<string, unknown>> {
  const stepDef = RFP_STEP_DEFINITIONS.find(s => s.stepNumber === stepNumber);
  if (!stepDef) throw new Error(`유효하지 않은 단계: ${stepNumber}`);

  const rfpFile = await rfpRepository.getFileByProjectId(projectId);
  if (!rfpFile) throw new Error('RFP 파일이 없습니다');

  // 프롬프트 확인 (없으면 자동 생성)
  await ensureStepPrompt(stepDef.slug);

  // 진행 상태 업데이트
  await analysisStepRepository.upsert({
    projectId, stepNumber: stepDef.stepNumber, slug: stepDef.slug, status: 'running',
  });

  onProgress?.({
    step: stepDef.label,
    progress: Math.round((stepNumber / 7) * 100),
    stepIndex: stepNumber - 1,
    totalSteps: 7,
  });

  try {
    // 이전 단계 결과 수집
    const previousResults = await collectPreviousResults(projectId, stepNumber);

    // 프롬프트 로드
    const prompt = await getPrompt(stepDef.slug);

    // RAG 검색 시도 (Qdrant 벡터 등록된 경우)
    let ragContext = '';
    let visionImages: Array<{ base64: string }> = [];

    if (rfpFile.vectorStatus === 'completed') {
      try {
        const { ragSearch } = await import('@/lib/vector/rag.service');
        const ragResult = await ragSearch(projectId, stepDef.label);
        ragContext = ragResult.chunks.map(c => c.text).join('\n\n');
        visionImages = ragResult.pageImages;
      } catch { /* RAG 실패 시 텍스트 폴백 */ }
    }

    // 프롬프트 구성
    const previousJson = Object.values(previousResults).map(v => JSON.stringify(v)).join('\n');
    let userPrompt: string;

    if (ragContext) {
      // RAG 모드: 검색된 청크만 전달 (rawText 없음)
      userPrompt = prompt.buildUserPrompt(ragContext, previousJson);
    } else {
      // 폴백: rawText 축소 전달
      userPrompt = prompt.buildUserPrompt(rfpFile.rawText.slice(0, 20000), previousJson);
    }

    // LLM 호출 (Vision 이미지 포함 가능)
    let resultText: string;

    if (visionImages.length > 0 && getActiveProvider() === 'gpt') {
      // GPT + Vision: 이미지 첨부
      const { getApiKey } = await import('@/lib/ai/client');
      const OpenAI = (await import('openai')).default;
      const apiKey = await getApiKey('gpt');
      const client = new OpenAI({ apiKey });

      const imageContent = visionImages.map(img => ({
        type: 'image_url' as const,
        image_url: { url: `data:image/png;base64,${img.base64}` },
      }));

      const response = await client.chat.completions.create({
        model: process.env.AI_MODEL_GPT ?? 'gpt-4o',
        max_tokens: prompt.maxTokens,
        messages: [
          { role: 'system', content: prompt.systemPrompt },
          { role: 'user', content: [
            { type: 'text', text: userPrompt },
            ...imageContent,
          ]},
        ],
      });
      resultText = response.choices[0]?.message?.content ?? '';
    } else {
      resultText = await generateText({
        systemPrompt: prompt.systemPrompt,
        userPrompt,
        maxTokens: prompt.maxTokens,
      });
    }

    // 결과 파싱
    const result = parseJson<Record<string, unknown>>(resultText, {});

    // DB 저장
    await analysisStepRepository.upsert({
      projectId, stepNumber: stepDef.stepNumber, slug: stepDef.slug,
      status: 'completed', result, promptUsed: userPrompt.slice(0, 2000),
    });

    // 마지막 단계면 전체 결과 합산하여 rfpAnalyses에도 저장
    if (stepNumber === 7) {
      await mergeAndSaveAnalysis(projectId);
    }

    return result;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '분석 실패';
    await analysisStepRepository.upsert({
      projectId, stepNumber: stepDef.stepNumber, slug: stepDef.slug,
      status: 'failed', errorMessage,
    });
    throw err;
  }
}

/** 전체 7단계 순차 실행 (중단된 단계부터 재개) */
export async function runFullStepAnalysis(
  projectId: string,
  onProgress?: ProgressCallback,
): Promise<void> {
  await projectRepository.updateStatus(projectId, 'analyzing');

  const existingSteps = await analysisStepRepository.getByProject(projectId);

  for (const stepDef of RFP_STEP_DEFINITIONS) {
    const existing = existingSteps.find(s => s.stepNumber === stepDef.stepNumber);

    // 이미 완료된 단계는 건너뜀
    if (existing?.status === 'completed') {
      onProgress?.({
        step: `${stepDef.label} (완료됨)`,
        progress: Math.round((stepDef.stepNumber / 7) * 100),
        stepIndex: stepDef.stepNumber - 1,
        totalSteps: 7,
      });
      continue;
    }

    await runAnalysisStep(projectId, stepDef.stepNumber, onProgress);
  }

  await projectRepository.updateStatus(projectId, 'direction_set');
  onProgress?.({ step: '전체 분석 완료', progress: 100, stepIndex: 7, totalSteps: 7 });
}

/** 이전 단계 결과 수집 */
async function collectPreviousResults(projectId: string, beforeStep: number): Promise<Record<string, unknown>> {
  const steps = await analysisStepRepository.getByProject(projectId);
  const results: Record<string, unknown> = {};
  for (const step of steps) {
    if (step.stepNumber < beforeStep && step.status === 'completed' && step.result) {
      results[step.slug] = step.result;
    }
  }
  return results;
}

/** 7단계 결과 합산 → rfpAnalyses 테이블에 저장 */
async function mergeAndSaveAnalysis(projectId: string): Promise<void> {
  const steps = await analysisStepRepository.getByProject(projectId);
  const merged: Record<string, unknown> = {};

  for (const step of steps) {
    if (step.status === 'completed' && step.result) {
      Object.assign(merged, step.result);
    }
  }

  const overview = (merged.overview ?? {}) as Record<string, unknown>;
  const evalItems = (merged.evaluationItems ?? []) as Array<Record<string, unknown>>;

  await rfpRepository.createAnalysis({
    projectId,
    overview: overview as { projectName: string; client: string; budget: string; duration: string; summary: string },
    requirements: (merged.requirements ?? []) as never[],
    evaluationCriteria: evalItems.map((item) => ({
      category: String(item.category ?? ''),
      item: String(item.item ?? ''),
      score: Number(item.score ?? 0),
      description: String(item.criteria ?? item.item ?? ''),
    })),
    evaluationItems: evalItems as never[],
    traceabilityMatrix: (merged.traceabilityMatrix ?? []) as never[],
    qualifications: (merged.qualifications ?? []) as never[],
    strategyPoints: (merged.strategyPoints ?? []) as never[],
    recommendedChapters: (merged.recommendedChapters ?? []) as never[],
    scope: (merged.scope ?? { inScope: [], outOfScope: [] }) as { inScope: string[]; outOfScope: string[] },
    constraints: (merged.constraints ?? { technical: [], business: [], timeline: [] }) as { technical: string[]; business: string[]; timeline: string[] },
    keywords: (merged.keywords ?? []) as string[],
  });
}

// chunkRfpText 재export (API에서 사용)
export { chunkRfpText };
