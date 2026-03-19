import { NextRequest, NextResponse } from 'next/server';
import { revertToVersion } from '@/lib/services/prompt.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { version } = await request.json();

    if (typeof version !== 'number') {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_FIELDS', message: 'version(숫자)은 필수입니다' } },
        { status: 400 },
      );
    }

    const updated = await revertToVersion(slug, version);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : '버전 되돌리기에 실패했습니다';
    return NextResponse.json(
      { success: false, error: { code: 'REVERT_ERROR', message } },
      { status: 500 },
    );
  }
}
