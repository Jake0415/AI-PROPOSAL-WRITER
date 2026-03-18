// 메모리 기반 Rate Limiter (단일 인스턴스용)

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// 만료된 항목 정리 (5분마다)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  maxRequests: number;  // 윈도우당 최대 요청 수
  windowMs: number;     // 윈도우 크기 (밀리초)
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { maxRequests: 30, windowMs: 60_000 },
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // 새 윈도우 시작
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.maxRequests - 1, resetAt: now + options.windowMs };
  }

  entry.count++;

  if (entry.count > options.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: options.maxRequests - entry.count, resetAt: entry.resetAt };
}

// AI API용 (분당 10회 제한)
export function checkAiRateLimit(userId: string): RateLimitResult {
  return checkRateLimit(`ai:${userId}`, { maxRequests: 10, windowMs: 60_000 });
}

// 일반 API용 (분당 60회 제한)
export function checkApiRateLimit(ip: string): RateLimitResult {
  return checkRateLimit(`api:${ip}`, { maxRequests: 60, windowMs: 60_000 });
}
