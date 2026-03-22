import { NextRequest } from 'next/server';
import { generateChapterSections } from '@/lib/services/section-generator.service';
import { createSSEResponse } from '@/lib/utils/sse-stream';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  let chapterPath = '1';
  let skipExisting = true;
  try {
    const body = await request.json();
    chapterPath = body.chapterPath ?? '1';
    skipExisting = body.skipExisting ?? true;
  } catch { /* body 없으면 기본값 */ }

  return createSSEResponse(
    (onProgress) => generateChapterSections(projectId, chapterPath, onProgress, skipExisting),
    'CHAPTER_GENERATION_ERROR',
    '챕터 섹션 생성에 실패했습니다',
  );
}
