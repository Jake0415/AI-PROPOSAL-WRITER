import { NextRequest, NextResponse } from 'next/server';
import { profileRepository } from '@/lib/repositories/profile.repository';
import { getSessionFromCookies } from '@/lib/auth/session';

// 프로필 조회
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_PARAM', message: 'userId가 필요합니다' } },
        { status: 400 },
      );
    }

    // 현재 세션 사용자인 경우 프로필 반환
    const session = await getSessionFromCookies();
    if (session && session.userId === userId) {
      const profile = await profileRepository.findByUserId(userId);
      if (profile) {
        return NextResponse.json({ success: true, data: profile });
      }
    }

    // 다른 사용자 프로필 조회
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '프로필을 찾을 수 없습니다' } },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: profile });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'PROFILE_ERROR', message: '프로필 조회에 실패했습니다' } },
      { status: 500 },
    );
  }
}
