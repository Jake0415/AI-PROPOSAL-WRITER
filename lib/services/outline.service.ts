import { generateText } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import { projectRepository } from '@/lib/repositories/project.repository';
import { analysisStepRepository } from '@/lib/repositories/analysis-step.repository';
// analysisStepRepository.getByStep(projectId, 7) → Step 7 결과 조회
import { getPrompt } from '@/lib/services/prompt.service';
import type { OutlineSection } from '@/lib/ai/types';
import type { SSEProgress } from '@/lib/utils/sse-stream';

type ProgressCallback = (p: SSEProgress) => void;

interface RecommendedChapter {
  chapter: string;
  evalId: string;
  score: number;
  relatedRequirements: string[];
  recommendedPages: number;
}

/**
 * 목차 생성: Step 7(배분 가이드)의 recommendedChapters를 기반으로
 * 챕터별 단계적으로 LLM 호출하여 서브섹션 생성
 */
export async function generateOutline(
  projectId: string,
  onProgress?: ProgressCallback,
): Promise<OutlineSection[]> {
  onProgress?.({ step: '데이터 로딩', progress: 5 });

  // 필요 데이터 로드
  const [analysis, strategy, step7Result] = await Promise.all([
    rfpRepository.getAnalysisByProjectId(projectId),
    proposalRepository.getStrategy(projectId),
    analysisStepRepository.getByStep(projectId, 7),
  ]);

  if (!analysis || !strategy) {
    throw new Error('분석 또는 전략 데이터가 없습니다. 이전 단계를 먼저 완료해주세요.');
  }

  // Step 7의 recommendedChapters 가져오기
  let chapters: RecommendedChapter[] = [];
  if (step7Result?.result) {
    const result = step7Result.result as Record<string, unknown>;
    chapters = (result.recommendedChapters as RecommendedChapter[]) ?? [];
  }

  // Step 7 결과가 없으면 기본 챕터 구성
  if (chapters.length === 0) {
    chapters = [
      { chapter: '01-사업이해도', evalId: 'EVAL-001', score: 20, relatedRequirements: [], recommendedPages: 15 },
      { chapter: '02-기술부문', evalId: 'EVAL-002', score: 50, relatedRequirements: [], recommendedPages: 40 },
      { chapter: '03-관리부문', evalId: 'EVAL-003', score: 15, relatedRequirements: [], recommendedPages: 12 },
      { chapter: '04-지원부문', evalId: 'EVAL-004', score: 10, relatedRequirements: [], recommendedPages: 8 },
      { chapter: '05-별첨', evalId: 'EVAL-005', score: 5, relatedRequirements: [], recommendedPages: 5 },
    ];
  }

  // 컨텍스트 준비 (축약)
  const contextJson = JSON.stringify({
    overview: analysis.overview,
    evaluationCriteria: analysis.evaluationCriteria,
    requirementsSummary: `총 ${(analysis.requirements ?? []).length}개 요구사항`,
    strategyHighlights: {
      competitiveStrategy: strategy.competitiveStrategy,
      differentiators: strategy.differentiators,
    },
  });

  const stepLabels = chapters.map((ch, i) => `챕터 ${i + 1}/${chapters.length}: ${ch.chapter}`);
  onProgress?.({
    step: `${chapters.length}개 챕터 목차 생성 시작`,
    progress: 10,
    steps: stepLabels,
    totalSteps: chapters.length,
    stepIndex: 0,
  });

  const prompt = await getPrompt('outline-generation');
  const allSections: OutlineSection[] = [];

  // 챕터별 순차 LLM 호출
  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i];
    const chapterNum = i + 1;
    const pct = 10 + Math.round((i / chapters.length) * 75);

    onProgress?.({
      step: `챕터 ${chapterNum}/${chapters.length}: ${ch.chapter} (${ch.score}점)`,
      progress: pct,
      stepIndex: i,
      totalSteps: chapters.length,
    });

    const chapterInfo = JSON.stringify({
      chapterNumber: chapterNum,
      chapterTitle: ch.chapter,
      evalId: ch.evalId,
      score: ch.score,
      recommendedPages: ch.recommendedPages,
      relatedRequirements: ch.relatedRequirements,
    });

    try {
      const result = await generateText({
        systemPrompt: prompt.systemPrompt,
        userPrompt: prompt.buildUserPrompt(chapterInfo, contextJson),
        maxTokens: prompt.maxTokens,
      });

      // JSON 파싱
      let subSections: OutlineSection[] = [];
      try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
        subSections = parsed.sections ?? [];
      } catch { /* 파싱 실패 시 빈 배열 */ }

      // 챕터(level 1) 생성 + 서브섹션 연결
      const chapterSection: OutlineSection = {
        id: `sec-${chapterNum}`,
        title: `${chapterNum}. ${ch.chapter.replace(/^\d+-/, '')}`,
        level: 1,
        order: chapterNum,
        children: subSections,
      };

      allSections.push(chapterSection);
    } catch (err) {
      // 개별 챕터 실패 시 빈 챕터로 추가 (전체 실패 방지)
      allSections.push({
        id: `sec-${chapterNum}`,
        title: `${chapterNum}. ${ch.chapter.replace(/^\d+-/, '')} (생성 실패)`,
        level: 1,
        order: chapterNum,
        children: [],
      });
      console.warn(`챕터 ${chapterNum} 생성 실패:`, err instanceof Error ? err.message : err);
    }
  }

  // DB 저장
  onProgress?.({ step: '결과 저장', progress: 90 });

  // 기존 outline 삭제 후 재생성
  const existingOutline = await proposalRepository.getOutline(projectId);
  if (existingOutline) {
    await proposalRepository.updateOutline(existingOutline.id, allSections);
  } else {
    await proposalRepository.createOutline(projectId, allSections);
  }

  await projectRepository.updateStatus(projectId, 'outline_ready');
  onProgress?.({ step: '완료', progress: 100 });

  return allSections;
}
