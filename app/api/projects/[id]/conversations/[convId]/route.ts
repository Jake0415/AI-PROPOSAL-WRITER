import { NextRequest, NextResponse } from 'next/server';
import { conversationService } from '@/lib/services/conversation.service';
import { conversationRepository } from '@/lib/repositories/conversation.repository';

// GET - 대화 상세 (이력 포함)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; convId: string }> },
) {
  try {
    const { convId } = await params;
    const conversation = await conversationRepository.findById(convId);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '대화를 찾을 수 없습니다' } },
        { status: 404 },
      );
    }

    const messageList = await conversationService.getHistory(convId);
    return NextResponse.json({ success: true, data: { ...conversation, messages: messageList } });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '대화 조회에 실패했습니다' } },
      { status: 500 },
    );
  }
}

// DELETE - 대화 아카이브
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; convId: string }> },
) {
  try {
    const { convId } = await params;
    await conversationService.archiveConversation(convId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '대화 아카이브에 실패했습니다' } },
      { status: 500 },
    );
  }
}
