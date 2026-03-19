import { NextRequest, NextResponse } from 'next/server';
import { proposalRepository } from '@/lib/repositories/proposal.repository';

// 섹션 내용 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> },
) {
  const { sectionId } = await params;

  try {
    const body = await request.json();
    const { content } = body as { content: string };

    await proposalRepository.updateSection(sectionId, {
      content,
      status: 'edited',
      editedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: '섹션 수정에 실패했습니다' } },
      { status: 500 },
    );
  }
}
