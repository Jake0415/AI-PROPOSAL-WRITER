import { generateText } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import { projectRepository } from '@/lib/repositories/project.repository';
import { reviewRepository } from '@/lib/repositories/review.repository';
import {
  REVIEW_SYSTEM_PROMPT,
  buildReviewPrompt,
} from '@/lib/ai/prompts/review-generation';
import type { ReviewReportResult } from '@/lib/ai/types';
import type { ReviewGrade } from '@/lib/db/schema';
import type { SSEProgress } from '@/lib/utils/sse-stream';

type ProgressCallback = (p: SSEProgress) => void;

function parseReviewJson(result: string): ReviewReportResult {
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
  } catch {
    return {
      overallScore: 0,
      totalPossible: 100,
      grade: 'F',
      evalCoverage: 0,
      reqCoverage: 0,
      formatCompliance: 0,
      evalResults: [],
      reqResults: [],
      improvements: [],
      summary: '검증 결과 파싱에 실패했습니다. 다시 시도해주세요.',
    };
  }
}

export async function generateReview(
  projectId: string,
  onProgress?: ProgressCallback,
): Promise<ReviewReportResult> {
  await projectRepository.updateStatus(projectId, 'reviewing');
  onProgress?.({ step: '데이터 로딩', progress: 10 });

  const [analysis, strategy, sections] = await Promise.all([
    rfpRepository.getAnalysisByProjectId(projectId),
    proposalRepository.getStrategy(projectId),
    proposalRepository.getSectionsByProject(projectId),
  ]);

  if (!analysis || sections.length === 0) {
    throw new Error('분석 결과와 섹션 데이터가 필요합니다. 이전 단계를 먼저 완료해주세요.');
  }

  onProgress?.({ step: '제안서 검증 중 (AI 분석)', progress: 30 });

  const analysisJson = JSON.stringify({
    overview: JSON.parse(analysis.overview),
    evaluationItems: JSON.parse(analysis.evaluationItems),
    requirements: JSON.parse(analysis.requirements),
    traceabilityMatrix: JSON.parse(analysis.traceabilityMatrix),
  });

  const sectionsJson = JSON.stringify(
    sections.map((s) => ({
      sectionPath: s.sectionPath,
      title: s.title,
      content: s.content,
    })),
  );

  const strategyJson = strategy
    ? JSON.stringify({
        competitiveStrategy: strategy.competitiveStrategy,
        differentiators: JSON.parse(strategy.differentiators),
        keyMessages: JSON.parse(strategy.keyMessages),
      })
    : '{}';

  const result = await generateText({
    systemPrompt: REVIEW_SYSTEM_PROMPT,
    userPrompt: buildReviewPrompt(analysisJson, sectionsJson, strategyJson),
    maxTokens: 16384,
  });

  onProgress?.({ step: '결과 저장', progress: 85 });

  const reviewData = parseReviewJson(result);

  await reviewRepository.create({
    projectId,
    overallScore: reviewData.overallScore,
    totalPossible: reviewData.totalPossible,
    grade: (reviewData.grade || 'F') as ReviewGrade,
    evalCoverage: reviewData.evalCoverage,
    reqCoverage: reviewData.reqCoverage,
    formatCompliance: reviewData.formatCompliance,
    evalResults: JSON.stringify(reviewData.evalResults ?? []),
    reqResults: JSON.stringify(reviewData.reqResults ?? []),
    improvements: JSON.stringify(reviewData.improvements ?? []),
    summary: reviewData.summary ?? '',
  });

  onProgress?.({ step: '완료', progress: 100 });

  return reviewData;
}
