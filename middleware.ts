import { type NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { generateRequestId, logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/security/rate-limiter';

// 인증 불필요한 공개 경로
const PUBLIC_PATHS = ['/auth', '/guide', '/api/health', '/api/auth', '/setup', '/api/setup'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function isStaticPath(pathname: string): boolean {
  return pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.');
}

// 클라이언트 IP 추출
function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? '127.0.0.1';
}

// Edge Runtime 호환 JWT 검증
async function verifyAuthToken(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return false;

  const secret = process.env.JWT_SECRET;
  if (!secret) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const start = Date.now();

  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }

  // requestId 생성
  const requestId = generateRequestId();

  // Rate Limit (API 요청만)
  if (pathname.startsWith('/api/')) {
    const ip = getClientIp(request);
    const isAiEndpoint = pathname.includes('/generate') || pathname.includes('/analyze');
    const limit = isAiEndpoint
      ? checkRateLimit(`ai:${ip}`, { maxRequests: 10, windowMs: 60_000 })
      : checkRateLimit(`api:${ip}`, { maxRequests: 100, windowMs: 60_000 });

    if (!limit.allowed) {
      logger.warn('Rate limit exceeded', { requestId, ip, pathname });
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMIT', message: '요청이 너무 많습니다' } },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
            'X-Request-Id': requestId,
          },
        },
      );
    }
  }

  // JWT 검증
  const isAuthenticated = await verifyAuthToken(request);

  const response = NextResponse.next();

  // 응답 헤더에 requestId + 보안 헤더 추가
  response.headers.set('X-Request-Id', requestId);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 공개 경로는 통과
  if (isPublicPath(pathname)) {
    logRequest(requestId, request, 200, start);
    return response;
  }

  // 미인증 사용자 처리
  if (!isAuthenticated) {
    if (pathname.startsWith('/api/')) {
      logRequest(requestId, request, 401, start);
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401, headers: { 'X-Request-Id': requestId } },
      );
    }
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    logRequest(requestId, request, 302, start);
    return NextResponse.redirect(loginUrl);
  }

  logRequest(requestId, request, 200, start);
  return response;
}

function logRequest(requestId: string, request: NextRequest, status: number, start: number) {
  const duration = Date.now() - start;
  logger.info(`${request.method} ${request.nextUrl.pathname}`, {
    requestId,
    method: request.method,
    path: request.nextUrl.pathname,
    status,
    duration,
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
