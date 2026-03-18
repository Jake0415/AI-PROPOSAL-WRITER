import { NextRequest, NextResponse } from 'next/server';
import { settingsRepository } from '@/lib/repositories/settings.repository';
import { setRuntimeProvider } from '@/lib/ai/client';
import type { AiProviderType } from '@/lib/db/schema';

// AI 설정 조회
export async function GET() {
  try {
    const settings = await settingsRepository.getAiSettings();
    return NextResponse.json({
      success: true,
      data: {
        provider: settings.provider,
        claudeModel: settings.claudeModel,
        gptModel: settings.gptModel,
        // API 키 보유 여부만 전달 (키 값 비공개)
        hasClaudeKey: !!process.env.ANTHROPIC_API_KEY,
        hasGptKey: !!process.env.OPENAI_API_KEY,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SETTINGS_ERROR', message: '설정을 불러올 수 없습니다' } },
      { status: 500 },
    );
  }
}

// AI 설정 변경
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, claudeModel, gptModel } = body as {
      provider?: AiProviderType;
      claudeModel?: string;
      gptModel?: string;
    };

    // 유효성 검증
    if (provider && !['claude', 'gpt'].includes(provider)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PROVIDER', message: '유효하지 않은 프로바이더입니다' } },
        { status: 400 },
      );
    }

    const updated = await settingsRepository.updateAiSettings({
      provider,
      claudeModel,
      gptModel,
    });

    // 런타임 프로바이더 즉시 반영
    if (updated.provider) {
      setRuntimeProvider(updated.provider);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: '설정 변경에 실패했습니다' } },
      { status: 500 },
    );
  }
}
