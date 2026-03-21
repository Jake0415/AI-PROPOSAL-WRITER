import { NextRequest, NextResponse } from 'next/server';
import { conversationRepository } from '@/lib/repositories/conversation.repository';
import { requireRole } from '@/lib/auth/with-auth';

// GET - LLM 사용량 로그 조회
export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole('admin');
    if (auth instanceof NextResponse) return auth;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId') ?? undefined;
    const limit = parseInt(searchParams.get('limit') ?? '100', 10);

    const logs = await conversationRepository.getLlmLogs({ projectId, limit });
    return NextResponse.json({ success: true, data: logs });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'LLM 로그 조회에 실패했습니다' } },
      { status: 500 },
    );
  }
}
