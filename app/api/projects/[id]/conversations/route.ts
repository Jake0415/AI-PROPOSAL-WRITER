import { NextRequest, NextResponse } from 'next/server';
import { conversationService } from '@/lib/services/conversation.service';
import type { ConversationTopic } from '@/lib/db/schema';

// POST - 대화 시작
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { userId, topic, stageContext } = body as {
      userId: string;
      topic: ConversationTopic;
      stageContext?: Record<string, unknown>;
    };

    if (!userId || !topic) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'userId와 topic은 필수입니다' } },
        { status: 400 },
      );
    }

    const conversation = await conversationService.startConversation(projectId, userId, topic, stageContext);
    return NextResponse.json({ success: true, data: conversation }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '대화 시작에 실패했습니다' } },
      { status: 500 },
    );
  }
}

// GET - 대화 목록
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;
    const list = await conversationService.listConversations(projectId);
    return NextResponse.json({ success: true, data: list });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '대화 목록 조회에 실패했습니다' } },
      { status: 500 },
    );
  }
}
