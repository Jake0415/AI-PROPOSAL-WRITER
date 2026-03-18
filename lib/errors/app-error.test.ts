import { describe, it, expect } from 'vitest';
import { AppError, Errors } from './app-error';

describe('AppError', () => {
  it('올바른 JSON을 반환한다', () => {
    const error = new AppError('TEST', '테스트 에러', 400);
    expect(error.toJSON()).toEqual({
      success: false,
      error: { code: 'TEST', message: '테스트 에러' },
    });
  });

  it('statusCode 기본값은 500', () => {
    const error = new AppError('TEST', '테스트');
    expect(error.statusCode).toBe(500);
  });
});

describe('Errors 팩토리', () => {
  it('notFound는 404', () => {
    const error = Errors.notFound('프로젝트');
    expect(error.statusCode).toBe(404);
    expect(error.message).toContain('프로젝트');
  });

  it('validation은 400', () => {
    const error = Errors.validation('잘못된 입력');
    expect(error.statusCode).toBe(400);
  });

  it('unauthorized는 401', () => {
    expect(Errors.unauthorized().statusCode).toBe(401);
  });

  it('forbidden은 403', () => {
    expect(Errors.forbidden().statusCode).toBe(403);
  });

  it('rateLimit은 429', () => {
    expect(Errors.rateLimit().statusCode).toBe(429);
  });
});
