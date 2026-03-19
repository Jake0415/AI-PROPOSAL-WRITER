import { NextRequest, NextResponse } from 'next/server';
import { tenantSettingsRepository } from '@/lib/repositories/tenant-settings.repository';

export async function GET() {
  try {
    const settings = await tenantSettingsRepository.get();
    return NextResponse.json({ success: true, data: settings });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SETTINGS_ERROR', message: '설정을 불러올 수 없습니다' } },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { appName, logoUrl, primaryColor } = body as {
      appName?: string;
      logoUrl?: string;
      primaryColor?: string;
    };

    if (appName !== undefined && appName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_NAME', message: '앱 이름을 입력해주세요' } },
        { status: 400 },
      );
    }

    const updated = await tenantSettingsRepository.update({
      appName: appName?.trim(),
      logoUrl,
      primaryColor,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: '설정 변경에 실패했습니다' } },
      { status: 500 },
    );
  }
}
