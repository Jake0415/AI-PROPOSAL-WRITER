import { NextResponse } from 'next/server';
import { AppError } from './app-error';
import { logger } from '@/lib/logger';

// API 라우트에서 에러를 일관된 JSON 응답으로 변환
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    logger.warn(`API 에러: ${error.code}`, {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    });
    return NextResponse.json(error.toJSON(), { status: error.statusCode });
  }

  const message = error instanceof Error ? error.message : '서버 내부 오류';
  logger.error('예기치 않은 에러', { message, stack: error instanceof Error ? error.stack : undefined });

  return NextResponse.json(
    {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '서버 내부 오류가 발생했습니다' },
    },
    { status: 500 },
  );
}
