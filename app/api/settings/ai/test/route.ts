import { NextRequest, NextResponse } from 'next/server';
import type { AiProvider } from '@/lib/ai/providers/types';
import { claudeProvider } from '@/lib/ai/providers/claude';
import { gptProvider } from '@/lib/ai/providers/gpt';

// AI 연결 테스트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider } = body as { provider: AiProvider };

    if (!provider || !['claude', 'gpt'].includes(provider)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PROVIDER', message: '유효하지 않은 프로바이더입니다' } },
        { status: 400 },
      );
    }

    // API 키 존재 확인
    if (provider === 'claude' && !process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        success: false,
        error: { code: 'NO_API_KEY', message: 'ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다' },
      });
    }
    if (provider === 'gpt' && !process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: { code: 'NO_API_KEY', message: 'OPENAI_API_KEY 환경변수가 설정되지 않았습니다' },
      });
    }

    // 간단한 테스트 호출
    const selectedProvider = provider === 'gpt' ? gptProvider : claudeProvider;
    const result = await selectedProvider.generateText({
      systemPrompt: '당신은 도우미입니다.',
      userPrompt: '"connected": true 만 JSON으로 응답하세요.',
      maxTokens: 50,
    });

    return NextResponse.json({
      success: true,
      data: {
        provider,
        connected: true,
        response: result.slice(0, 100),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '연결 테스트에 실패했습니다';
    return NextResponse.json({
      success: false,
      error: { code: 'CONNECTION_ERROR', message },
    });
  }
}
