import { NextRequest, NextResponse } from 'next/server';
import { reviewRepository } from '@/lib/repositories/review.repository';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  try {
    const report = await reviewRepository.getByProjectId(projectId);
    if (!report) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: {
        overallScore: report.overallScore,
        totalPossible: report.totalPossible,
        grade: report.grade,
        evalCoverage: report.evalCoverage,
        reqCoverage: report.reqCoverage,
        formatCompliance: report.formatCompliance,
        evalResults: report.evalResults,
        reqResults: report.reqResults,
        improvements: report.improvements,
        summary: report.summary,
        generatedAt: report.generatedAt,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '검증 결과 조회에 실패했습니다';
    return NextResponse.json(
      { success: false, error: { code: 'REVIEW_FETCH_ERROR', message } },
      { status: 500 },
    );
  }
}
