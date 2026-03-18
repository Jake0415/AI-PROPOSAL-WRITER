import { generateText } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { projectRepository } from '@/lib/repositories/project.repository';
import {
  RFP_ANALYSIS_SYSTEM_PROMPT,
  buildRfpAnalysisPrompt,
} from '@/lib/ai/prompts/rfp-analysis';
import type { RfpAnalysisResult } from '@/lib/ai/types';
import type { SSEProgress } from '@/lib/utils/sse-stream';

type ProgressCallback = (p: SSEProgress) => void;

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
  await projectRepository.updateStatus(projectId, 'analyzing');
  onProgress?.({ step: 'RFP 텍스트 로딩', progress: 10 });

  const rfpFile = await rfpRepository.getFileByProjectId(projectId);
  if (!rfpFile) {
    throw new Error('RFP 파일이 없습니다');
  }

  onProgress?.({ step: '수주 최적화 AI 분석 시작 (7단계)', progress: 20 });

  const result = await generateText({
    systemPrompt: RFP_ANALYSIS_SYSTEM_PROMPT,
    userPrompt: buildRfpAnalysisPrompt(rfpFile.rawText),
    maxTokens: 16384,
  });

  onProgress?.({ step: '분석 결과 파싱', progress: 70 });

  const analysisData = parseAnalysisJson(result);

  onProgress?.({ step: 'DB 저장', progress: 85 });

  const evalItems = analysisData.evaluationItems ?? [];

  await rfpRepository.createAnalysis({
    projectId,
    overview: JSON.stringify(analysisData.overview ?? {}),
    requirements: JSON.stringify(analysisData.requirements ?? []),
    evaluationCriteria: JSON.stringify(evalItems),
    evaluationItems: JSON.stringify(evalItems),
    traceabilityMatrix: JSON.stringify(analysisData.traceabilityMatrix ?? []),
    qualifications: JSON.stringify(analysisData.qualifications ?? []),
    strategyPoints: JSON.stringify(analysisData.strategyPoints ?? []),
    recommendedChapters: JSON.stringify(analysisData.recommendedChapters ?? []),
    scope: JSON.stringify(analysisData.scope ?? {}),
    constraints: JSON.stringify(analysisData.constraints ?? {}),
    keywords: JSON.stringify(analysisData.keywords ?? []),
  });

  await projectRepository.updateStatus(projectId, 'direction_set');

  onProgress?.({ step: '완료', progress: 100 });

  return analysisData;
}
