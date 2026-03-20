import { NextRequest, NextResponse } from 'next/server';
import { versionService } from '@/lib/services/version.service';

// GET - 버전 상세 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> },
) {
  try {
    const { versionId } = await params;
    const version = await versionService.getVersion(versionId);
    if (!version) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '버전을 찾을 수 없습니다' } },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: version });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '버전 조회에 실패했습니다' } },
      { status: 500 },
    );
  }
}
