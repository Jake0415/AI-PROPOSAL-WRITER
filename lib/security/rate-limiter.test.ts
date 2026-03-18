import { describe, it, expect } from 'vitest';
import { checkRateLimit } from './rate-limiter';

describe('checkRateLimit', () => {
  it('첫 요청은 허용한다', () => {
    const key = `test-${Date.now()}`;
    const result = checkRateLimit(key, { maxRequests: 5, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('제한 초과 시 거부한다', () => {
    const key = `test-limit-${Date.now()}`;
    const opts = { maxRequests: 3, windowMs: 60_000 };

    checkRateLimit(key, opts);
    checkRateLimit(key, opts);
    checkRateLimit(key, opts);
    const result = checkRateLimit(key, opts);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('remaining이 정확히 감소한다', () => {
    const key = `test-remaining-${Date.now()}`;
    const opts = { maxRequests: 5, windowMs: 60_000 };

    expect(checkRateLimit(key, opts).remaining).toBe(4);
    expect(checkRateLimit(key, opts).remaining).toBe(3);
    expect(checkRateLimit(key, opts).remaining).toBe(2);
  });
});
