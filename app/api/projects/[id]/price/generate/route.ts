import { NextRequest } from 'next/server';
import { generatePrice } from '@/lib/services/price.service';
import { createSSEResponse } from '@/lib/utils/sse-stream';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  return createSSEResponse(
    (onProgress) => generatePrice(projectId, onProgress),
    'PRICE_ERROR',
    '가격 산출에 실패했습니다',
  );
}
