import { NextRequest, NextResponse } from 'next/server';
import { analysisStepRepository } from '@/lib/repositories/analysis-step.repository';

// GET - 전체 단계 상태 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;
    const steps = await analysisStepRepository.getByProject(projectId);
    return NextResponse.json({ success: true, data: steps });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '단계 조회에 실패했습니다' } },
      { status: 500 },
    );
  }
}
