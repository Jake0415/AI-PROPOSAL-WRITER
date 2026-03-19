import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { profileRepository } from '@/lib/repositories/profile.repository';
import { hashPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { setSessionCookie } from '@/lib/auth/session';

// 시스템에 사용자가 있는지 확인
export async function GET() {
  try {
    const userCount = await profileRepository.count();
    return NextResponse.json({
      success: true,
      data: { needsSetup: userCount === 0 },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SETUP_ERROR', message: '시스템 상태 확인에 실패했습니다' } },
      { status: 500 },
    );
  }
}

// Super Admin 등록
export async function POST(request: NextRequest) {
  try {
    // 이미 사용자가 있으면 차단
    const userCount = await profileRepository.count();
    if (userCount > 0) {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_SETUP', message: '이미 초기 설정이 완료되었습니다' } },
        { status: 403 },
      );
    }

    const { loginId, password, passwordConfirm, name, phone, department } = await request.json();

    if (!loginId || !password || !passwordConfirm || !name) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_FIELDS', message: '필수 항목을 모두 입력하세요' } },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: { code: 'WEAK_PASSWORD', message: '비밀번호는 6자 이상이어야 합니다' } },
        { status: 400 },
      );
    }

    if (password !== passwordConfirm) {
      return NextResponse.json(
        { success: false, error: { code: 'PASSWORD_MISMATCH', message: '비밀번호가 일치하지 않습니다' } },
        { status: 400 },
      );
    }

    const id = uuidv4();
    const passwordHash = await hashPassword(password);

    await profileRepository.create({
      id,
      loginId,
      passwordHash,
      name,
      phone: phone ?? '',
      department: department ?? '',
      role: 'super_admin',
    });

    const token = await signToken({ userId: id, loginId });

    const response = NextResponse.json({
      success: true,
      data: { id, loginId, name, role: 'super_admin' },
    });

    return setSessionCookie(response, token);
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SETUP_ERROR', message: '초기 설정에 실패했습니다' } },
      { status: 500 },
    );
  }
}
