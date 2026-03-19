import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { profileRepository } from '@/lib/repositories/profile.repository';

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 },
      );
    }

    const profile = await profileRepository.findByUserId(session.userId);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '프로필을 찾을 수 없습니다' } },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: profile.id,
        loginId: profile.loginId,
        name: profile.name,
        phone: profile.phone,
        department: profile.department,
        role: profile.role,
        avatarUrl: profile.avatarUrl,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_ERROR', message: '인증 확인에 실패했습니다' } },
      { status: 500 },
    );
  }
}
