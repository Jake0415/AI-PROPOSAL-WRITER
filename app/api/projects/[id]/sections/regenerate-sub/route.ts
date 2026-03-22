import { NextRequest, NextResponse } from 'next/server';
import { regenerateSubChapter } from '@/lib/services/section-generator.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  try {
    const body = await request.json();
    const subChapterPath = body.subChapterPath;
    if (!subChapterPath) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'subChapterPath가 필요합니다' } },
        { status: 400 },
      );
    }

    const result = await regenerateSubChapter(projectId, subChapterPath);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : '서브 챕터 생성에 실패했습니다';
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message } },
      { status: 500 },
    );
  }
}
