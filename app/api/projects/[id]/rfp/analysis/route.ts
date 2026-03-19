import { NextRequest, NextResponse } from 'next/server';
import { rfpRepository } from '@/lib/repositories/rfp.repository';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  try {
    const analysis = await rfpRepository.getAnalysisByProjectId(projectId);
    if (!analysis) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '분석 결과가 없습니다' } },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: '분석 결과를 불러올 수 없습니다' } },
      { status: 500 },
    );
  }
}
