import { generateText } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import { projectRepository } from '@/lib/repositories/project.repository';
import { getPrompt } from '@/lib/services/prompt.service';
import type { DirectionCandidate } from '@/lib/ai/types';
import type { SSEProgress } from '@/lib/utils/sse-stream';

type ProgressCallback = (p: SSEProgress) => void;

export async function generateDirections(
  projectId: string,
  onProgress?: ProgressCallback,
): Promise<DirectionCandidate[]> {
  onProgress?.({ step: '분석 결과 로딩', progress: 10 });

  const analysis = await rfpRepository.getAnalysisByProjectId(projectId);
  if (!analysis) {
    throw new Error('분석 결과가 없습니다');
  }

  onProgress?.({ step: '방향성 생성 중', progress: 30 });

  const analysisJson = JSON.stringify({
    overview: analysis.overview,
    requirements: analysis.requirements,
    evaluationCriteria: analysis.evaluationCriteria,
    keywords: analysis.keywords,
  });

  const prompt = await getPrompt('direction-generation');
  const result = await generateText({
    systemPrompt: prompt.systemPrompt,
    userPrompt: prompt.buildUserPrompt(analysisJson),
    maxTokens: prompt.maxTokens,
  });

  onProgress?.({ step: '결과 저장', progress: 80 });

  let candidates: DirectionCandidate[];
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
    candidates = parsed.candidates ?? [];
  } catch {
    candidates = [];
  }

  await proposalRepository.createDirection(projectId, candidates);

  onProgress?.({ step: '완료', progress: 100 });

  return candidates;
}

export async function selectDirection(
  projectId: string,
  selectedIndex: number,
): Promise<void> {
  const direction = await proposalRepository.getDirection(projectId);
  if (!direction) {
    throw new Error('방향성 데이터가 없습니다');
  }
  await proposalRepository.selectDirection(direction.id, selectedIndex);
  await projectRepository.updateStatus(projectId, 'direction_set');
}
