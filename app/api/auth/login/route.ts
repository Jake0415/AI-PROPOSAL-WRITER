import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { profiles } from '@/lib/db/schema';
import { comparePassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { setSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_FIELDS', message: '이메일과 비밀번호를 입력하세요' } },
        { status: 400 },
      );
    }

    const db = getDb();
    const results = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, email));

    const profile = results[0];
    if (!profile) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 올바르지 않습니다' } },
        { status: 401 },
      );
    }

    const valid = await comparePassword(password, profile.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 올바르지 않습니다' } },
        { status: 401 },
      );
    }

    const token = await signToken({ userId: profile.id, email: profile.email });

    const response = NextResponse.json({
      success: true,
      data: {
        id: profile.id,
        email: profile.email,
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
