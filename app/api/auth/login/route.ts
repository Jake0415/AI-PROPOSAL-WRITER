import { NextRequest, NextResponse } from 'next/server';
import { profileRepository } from '@/lib/repositories/profile.repository';
import { comparePassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { setSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const { loginId, password } = await request.json();

    if (!loginId || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_FIELDS', message: '아이디와 비밀번호를 입력하세요' } },
        { status: 400 },
      );
    }

    const profile = await profileRepository.findByLoginId(loginId);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: '아이디 또는 비밀번호가 올바르지 않습니다' } },
        { status: 401 },
      );
    }

    const valid = await comparePassword(password, profile.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: '아이디 또는 비밀번호가 올바르지 않습니다' } },
        { status: 401 },
      );
    }

    const token = await signToken({ userId: profile.id, loginId: profile.loginId });

    const response = NextResponse.json({
      success: true,
      data: {
        id: profile.id,
        loginId: profile.loginId,
        name: profile.name,
        role: profile.role,
      },
    });

    return setSessionCookie(response, token);
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'LOGIN_ERROR', message: '로그인에 실패했습니다' } },
      { status: 500 },
    );
  }
}
