import { NextRequest, NextResponse } from 'next/server';
import { settingsRepository } from '@/lib/repositories/settings.repository';
import { setRuntimeProvider } from '@/lib/ai/client';
import { maskApiKey } from '@/lib/security/encrypt';
import { decrypt } from '@/lib/security/encrypt';
import type { AiProviderType } from '@/lib/db/schema';

// AI 설정 조회
export async function GET() {
  try {
    const settings = await settingsRepository.getAiSettings();

    // DB 키 존재 여부 + 마스킹
    let claudeKeyMasked = '';
    let gptKeyMasked = '';
    let claudeKeyValid = false;
    let gptKeyValid = false;
    try {
      if (settings.claudeApiKey) {
        claudeKeyMasked = maskApiKey(decrypt(settings.claudeApiKey));
        claudeKeyValid = true;
      }
    } catch { claudeKeyMasked = '(복호화 실패 - 재입력 필요)'; }
    try {
      if (settings.gptApiKey) {
        gptKeyMasked = maskApiKey(decrypt(settings.gptApiKey));
        gptKeyValid = true;
      }
    } catch { gptKeyMasked = '(복호화 실패 - 재입력 필요)'; }

    return NextResponse.json({
      success: true,
      data: {
        provider: settings.provider,
        claudeModel: settings.claudeModel,
        gptModel: settings.gptModel,
        hasClaudeKey: claudeKeyValid || !!process.env.ANTHROPIC_API_KEY,
        hasGptKey: gptKeyValid || !!process.env.OPENAI_API_KEY,
        claudeKeyMasked,
        gptKeyMasked,
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
    const { provider, claudeModel, gptModel, claudeApiKey, gptApiKey } = body as {
      provider?: AiProviderType;
      claudeModel?: string;
      gptModel?: string;
      claudeApiKey?: string;
      gptApiKey?: string;
    };

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
      claudeApiKey,
      gptApiKey,
    });

    if (updated.provider) {
      setRuntimeProvider(updated.provider);
    }

    return NextResponse.json({ success: true, data: { provider: updated.provider, claudeModel: updated.claudeModel, gptModel: updated.gptModel } });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: '설정 변경에 실패했습니다' } },
      { status: 500 },
    );
  }
}
