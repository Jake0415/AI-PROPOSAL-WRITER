import { NextRequest, NextResponse } from 'next/server';
import { proposalRepository } from '@/lib/repositories/proposal.repository';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  try {
    const direction = await proposalRepository.getDirection(projectId);
    if (!direction) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: {
        candidates: direction.candidates,
        selectedIndex: direction.selectedIndex,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '방향성 조회에 실패했습니다';
    return NextResponse.json(
      { success: false, error: { code: 'DIRECTION_FETCH_ERROR', message } },
      { status: 500 },
    );
  }
}
