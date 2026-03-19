import { generateText } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import { projectRepository } from '@/lib/repositories/project.repository';
import { getPrompt } from '@/lib/services/prompt.service';

export interface StrategyResult {
  competitiveStrategy: string;
  differentiators: Array<{ title: string; description: string; evidence: string }>;
  keyMessages: string[];
}

import type { SSEProgress } from '@/lib/utils/sse-stream';

type ProgressCallback = (p: SSEProgress) => void;

export async function generateStrategy(
  projectId: string,
  onProgress?: ProgressCallback,
  writingStyle?: string,
): Promise<StrategyResult> {
  onProgress?.({ step: '데이터 로딩', progress: 10 });

  const analysis = await rfpRepository.getAnalysisByProjectId(projectId);
  const direction = await proposalRepository.getDirection(projectId);

  if (!analysis || !direction) {
    throw new Error('분석 결과 또는 방향성이 없습니다');
  }

  onProgress?.({ step: '전략 수립 중', progress: 30 });

  const analysisJson = JSON.stringify({
    overview: analysis.overview,
    requirements: analysis.requirements,
    evaluationCriteria: analysis.evaluationCriteria,
  });

  const candidates = direction.candidates;
  const selected = candidates[direction.selectedIndex ?? 0];

  const prompt = await getPrompt('strategy-generation');
  const result = await generateText({
    systemPrompt: prompt.systemPrompt,
    userPrompt: prompt.buildUserPrompt(analysisJson, JSON.stringify(selected), writingStyle),
    maxTokens: prompt.maxTokens,
  });

  onProgress?.({ step: '결과 저장', progress: 80 });

  let strategyData: StrategyResult;
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    strategyData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
  } catch {
    strategyData = {
      competitiveStrategy: result.slice(0, 500),
      differentiators: [],
      keyMessages: [],
    };
  }

  await proposalRepository.createStrategy(projectId, {
    competitiveStrategy: strategyData.competitiveStrategy ?? '',
    differentiators: strategyData.differentiators ?? [],
    keyMessages: strategyData.keyMessages ?? [],
  });

  await projectRepository.updateStatus(projectId, 'strategy_set');

  onProgress?.({ step: '완료', progress: 100 });

  return strategyData;
}
