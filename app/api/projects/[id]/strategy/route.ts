import { NextRequest, NextResponse } from 'next/server';
import { proposalRepository } from '@/lib/repositories/proposal.repository';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  try {
    const strategy = await proposalRepository.getStrategy(projectId);
    if (!strategy) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: '전략이 없습니다' } }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: strategy });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '전략 조회에 실패했습니다' } },
      { status: 500 },
    );
  }
}
