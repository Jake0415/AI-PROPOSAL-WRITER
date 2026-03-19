import { generateText } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import { projectRepository } from '@/lib/repositories/project.repository';
import {
  OUTLINE_SYSTEM_PROMPT,
  buildOutlinePrompt,
} from '@/lib/ai/prompts/outline-generation';
import type { OutlineSection } from '@/lib/ai/types';
import type { SSEProgress } from '@/lib/utils/sse-stream';

type ProgressCallback = (p: SSEProgress) => void;

export async function generateOutline(
  projectId: string,
  onProgress?: ProgressCallback,
): Promise<OutlineSection[]> {
  onProgress?.({ step: '데이터 로딩', progress: 10 });

  const analysis = await rfpRepository.getAnalysisByProjectId(projectId);
  const strategy = await proposalRepository.getStrategy(projectId);

  if (!analysis || !strategy) {
    throw new Error('분석 또는 전략 데이터가 없습니다');
  }

  onProgress?.({ step: '목차 생성 중', progress: 30 });

  const analysisJson = JSON.stringify({
    overview: analysis.overview,
    requirements: analysis.requirements,
    evaluationCriteria: analysis.evaluationCriteria,
  });

  const strategyJson = JSON.stringify({
    competitiveStrategy: strategy.competitiveStrategy,
    differentiators: strategy.differentiators,
    keyMessages: strategy.keyMessages,
  });

  const result = await generateText({
    systemPrompt: OUTLINE_SYSTEM_PROMPT,
    userPrompt: buildOutlinePrompt(analysisJson, strategyJson),
    maxTokens: 4096,
  });

  onProgress?.({ step: '결과 저장', progress: 80 });

  let sections: OutlineSection[];
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
    sections = parsed.sections ?? [];
  } catch {
    sections = [];
  }

  await proposalRepository.createOutline(projectId, sections);
  await projectRepository.updateStatus(projectId, 'outline_ready');

  onProgress?.({ step: '완료', progress: 100 });

  return sections;
}
