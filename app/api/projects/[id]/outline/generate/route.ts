import { NextRequest } from 'next/server';
import { generateOutline } from '@/lib/services/outline.service';
import { createSSEResponse } from '@/lib/utils/sse-stream';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  return createSSEResponse(
    (onProgress) => generateOutline(projectId, onProgress),
    'OUTLINE_ERROR',
    '목차 생성에 실패했습니다',
  );
}
