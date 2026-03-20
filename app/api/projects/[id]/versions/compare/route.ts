import { NextRequest, NextResponse } from 'next/server';
import { versionService } from '@/lib/services/version.service';

// GET - 두 버전 비교
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const v1 = searchParams.get('v1');
    const v2 = searchParams.get('v2');

    if (!v1 || !v2) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'v1, v2 파라미터가 필요합니다' } },
        { status: 400 },
      );
    }

    const result = await versionService.compareVersions(v1, v2);
    if (!result) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '버전을 찾을 수 없습니다' } },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '비교에 실패했습니다' } },
      { status: 500 },
    );
  }
}
