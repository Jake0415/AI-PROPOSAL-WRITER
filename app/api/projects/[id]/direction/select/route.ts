import { NextRequest, NextResponse } from 'next/server';
import { selectDirection } from '@/lib/services/direction.service';

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

    await selectDirection(projectId, selectedIndex);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '방향성 선택에 실패했습니다';
    return NextResponse.json(
      { success: false, error: { code: 'SELECT_ERROR', message } },
      { status: 500 },
    );
  }
}
