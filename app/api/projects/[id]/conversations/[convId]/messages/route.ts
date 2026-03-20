import { NextRequest } from 'next/server';
import { conversationService } from '@/lib/services/conversation.service';

// POST - 메시지 전송 (SSE 스트리밍)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; convId: string }> },
) {
  const { convId } = await params;
  const body = await request.json();
  const { message } = body as { message: string };

  if (!message?.trim()) {
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'INVALID_INPUT', message: '메시지를 입력해주세요' },
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const gen = conversationService.sendMessage(convId, message.trim());
        for await (const chunk of gen) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`));
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '메시지 전송에 실패했습니다';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: errorMsg })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
