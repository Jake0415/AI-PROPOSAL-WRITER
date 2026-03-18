import { NextRequest } from 'next/server';
import { generateStrategy } from '@/lib/services/strategy.service';
import { createSSEResponse } from '@/lib/utils/sse-stream';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  let writingStyle: string | undefined;
  try {
    const body = await request.json();
    writingStyle = body.writingStyle;
  } catch {
    // body가 없어도 기본 동작
  }

  return createSSEResponse(
    (onProgress) => generateStrategy(projectId, onProgress, writingStyle),
    'STRATEGY_ERROR',
    '전략 생성에 실패했습니다',
  );
}
