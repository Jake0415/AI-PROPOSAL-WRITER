import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// 인증 불필요한 공개 경로
const PUBLIC_PATHS = [
  '/auth',
  '/guide',
  '/api/health',
  '/api/auth',
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

// 정적 리소스 (미들웨어 스킵)
function isStaticPath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 리소스는 스킵
  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }

  // 세션 갱신
  const { user, supabaseResponse } = await updateSession(request);

  // 공개 경로는 통과
  if (isPublicPath(pathname)) {
    return supabaseResponse;
  }

  // 미인증 사용자 처리
  if (!user) {
    // API 요청은 JSON 에러 응답
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 },
      );
    }
    // 페이지 요청은 로그인으로 리다이렉트
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
