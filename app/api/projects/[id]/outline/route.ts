import { NextRequest, NextResponse } from 'next/server';
import { proposalRepository } from '@/lib/repositories/proposal.repository';

// 목차 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;
  try {
    const outline = await proposalRepository.getOutline(projectId);
    if (!outline) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '목차가 없습니다' } },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      data: { id: outline.id, sections: JSON.parse(outline.sections) },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: '목차를 불러올 수 없습니다' } },
      { status: 500 },
    );
  }
}

// 목차 수정 (드래그앤드롭 순서 변경)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;
  try {
    const body = await request.json();
    const { sections } = body as { sections: unknown[] };

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'sections 배열이 필요합니다' } },
        { status: 400 },
      );
    }

    const outline = await proposalRepository.getOutline(projectId);
    if (!outline) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '목차가 없습니다' } },
        { status: 404 },
      );
    }

    await proposalRepository.updateOutline(outline.id, JSON.stringify(sections));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: '목차 수정에 실패했습니다' } },
      { status: 500 },
    );
  }
}
