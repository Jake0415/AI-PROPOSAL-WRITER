import { NextRequest } from 'next/server';
import { generateReview } from '@/lib/services/review.service';
import { createSSEResponse } from '@/lib/utils/sse-stream';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  return createSSEResponse(
    (onProgress) => generateReview(projectId, onProgress),
    'REVIEW_ERROR',
    '제안서 검증에 실패했습니다',
  );
}
