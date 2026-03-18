import { NextRequest } from 'next/server';
import { generateDirections } from '@/lib/services/direction.service';
import { createSSEResponse } from '@/lib/utils/sse-stream';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  return createSSEResponse(
    (onProgress) => generateDirections(projectId, onProgress),
    'DIRECTION_ERROR',
    '방향성 생성에 실패했습니다',
  );
}
