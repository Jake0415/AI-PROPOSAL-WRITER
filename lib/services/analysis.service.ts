import { generateStream } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { projectRepository } from '@/lib/repositories/project.repository';
import { getPrompt } from '@/lib/services/prompt.service';
import type { RfpAnalysisResult } from '@/lib/ai/types';
import type { SSEProgress } from '@/lib/utils/sse-stream';

type ProgressCallback = (p: SSEProgress) => void;

const ANALYSIS_STEPS = [
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

function parseAnalysisJson(result: string): RfpAnalysisResult {
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
  } catch {
    return {
      overview: { projectName: '분석 실패', summary: result.slice(0, 500) },
      evaluationItems: [],
      requirements: [],
      traceabilityMatrix: [],
      qualifications: [],
      strategyPoints: [],
      recommendedChapters: [],
      scope: { inScope: [], outOfScope: [] },
      constraints: { technical: [], business: [], timeline: [] },
      keywords: [],
    } as unknown as RfpAnalysisResult;
  }
}

export async function runAnalysis(
  projectId: string,
  onProgress?: ProgressCallback,
): Promise<RfpAnalysisResult> {
  const stepLabels = ANALYSIS_STEPS.map((s) => s.label);
  const totalSteps = ANALYSIS_STEPS.length;

  await projectRepository.updateStatus(projectId, 'analyzing');
  onProgress?.({
    step: 'RFP 텍스트 로딩',
    progress: 5,
    steps: stepLabels,
    totalSteps,
    stepIndex: -1,
  });

  const rfpFile = await rfpRepository.getFileByProjectId(projectId);
  if (!rfpFile) {
    throw new Error('RFP 파일이 없습니다');
  }

  onProgress?.({
    step: '수주 최적화 AI 분석 시작',
    progress: 10,
    stepIndex: -1,
    totalSteps,
  });

  // 스트리밍으로 LLM 호출 + JSON 키 감지
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

    // 아직 감지하지 않은 다음 단계의 키가 나타났는지 확인 (forward-only)
    for (let i = currentStepIdx + 1; i < ANALYSIS_STEPS.length; i++) {
      if (accumulated.includes(ANALYSIS_STEPS[i].key)) {
        currentStepIdx = i;
        onProgress?.({
          step: ANALYSIS_STEPS[i].label,
          progress: ANALYSIS_STEPS[i].progress,
          stepIndex: i,
          totalSteps,
        });
      } else {
        break; // 순서대로만 감지 (건너뛰지 않음)
      }
    }
  }

  onProgress?.({ step: '분석 결과 파싱', progress: 95, stepIndex: totalSteps - 1, totalSteps });

  const analysisData = parseAnalysisJson(accumulated);

  onProgress?.({ step: 'DB 저장', progress: 97, stepIndex: totalSteps - 1, totalSteps });

  const evalItems = analysisData.evaluationItems ?? [];

  await rfpRepository.createAnalysis({
    projectId,
    overview: analysisData.overview ?? {},
    requirements: analysisData.requirements ?? [],
    evaluationCriteria: evalItems.map((item) => ({
      category: item.category,
      item: item.item,
      score: item.score,
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
