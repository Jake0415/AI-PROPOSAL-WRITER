import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/ai/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await params;
    const { systemPrompt, userPrompt, maxTokens } = await request.json();

    if (!systemPrompt || !userPrompt) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_FIELDS', message: 'systemPrompt와 userPrompt는 필수입니다' } },
        { status: 400 },
      );
    }

    const result = await generateText({
      systemPrompt,
      userPrompt,
      maxTokens: maxTokens ?? 1024,
    });

    return NextResponse.json({ success: true, data: { response: result } });
  } catch (err) {
    const message = err instanceof Error ? err.message : '테스트 실행에 실패했습니다';
    return NextResponse.json(
      { success: false, error: { code: 'TEST_ERROR', message } },
      { status: 500 },
    );
  }
}
