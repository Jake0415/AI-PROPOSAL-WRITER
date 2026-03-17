import { NextRequest, NextResponse } from 'next/server';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import { projectRepository } from '@/lib/repositories/project.repository';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  try {
    const body = await request.json();
    const { selectedIndex } = body;

    if (typeof selectedIndex !== 'number' || selectedIndex < 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INDEX', message: '유효하지 않은 선택입니다' } },
        { status: 400 },
      );
    }

    const direction = await proposalRepository.getDirection(projectId);
    if (!direction) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '방향성 후보가 없습니다' } },
        { status: 404 },
      );
    }

    await proposalRepository.selectDirection(direction.id, selectedIndex);
    await projectRepository.updateStatus(projectId, 'direction_set');

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SELECT_ERROR', message: '방향성 선택에 실패했습니다' } },
      { status: 500 },
    );
  }
}
