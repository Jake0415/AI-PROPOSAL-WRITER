import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db/client';
import { profiles } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { setSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_FIELDS', message: '모든 필드를 입력하세요' } },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: { code: 'WEAK_PASSWORD', message: '비밀번호는 6자 이상이어야 합니다' } },
        { status: 400 },
      );
    }

    const db = getDb();

    // 이메일 중복 확인
    const existing = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.email, email));

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: { code: 'EMAIL_EXISTS', message: '이미 등록된 이메일입니다' } },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();
    const id = uuidv4();
    const passwordHash = await hashPassword(password);

    await db.insert(profiles).values({
      id,
      email,
      passwordHash,
      name,
      role: 'viewer',
      createdAt: now,
      updatedAt: now,
    });

    const token = await signToken({ userId: id, email });

    const response = NextResponse.json({
      success: true,
      data: { id, email, name, role: 'viewer' },
    });

    return setSessionCookie(response, token);
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'REGISTER_ERROR', message: '회원가입에 실패했습니다' } },
      { status: 500 },
    );
  }
}
