// 구조화된 애플리케이션 에러

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
      },
    };
  }
}

// 자주 사용되는 에러 팩토리
export const Errors = {
  notFound: (resource: string) =>
    new AppError('NOT_FOUND', `${resource}을(를) 찾을 수 없습니다`, 404),

  validation: (message: string) =>
    new AppError('VALIDATION_ERROR', message, 400),

  unauthorized: () =>
    new AppError('UNAUTHORIZED', '인증이 필요합니다', 401),

  forbidden: () =>
    new AppError('FORBIDDEN', '접근 권한이 없습니다', 403),

  internal: (message = '서버 내부 오류가 발생했습니다') =>
    new AppError('INTERNAL_ERROR', message, 500),

  rateLimit: () =>
    new AppError('RATE_LIMIT', '요청이 너무 많습니다. 잠시 후 다시 시도해주세요', 429),

  missingData: (message: string) =>
    new AppError('MISSING_DATA', message, 400),
};
