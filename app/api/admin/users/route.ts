import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireRole } from '@/lib/auth/with-auth';
import { profileRepository } from '@/lib/repositories/profile.repository';
import { hashPassword } from '@/lib/auth/password';
import { ASSIGNABLE_ROLES } from '@/lib/auth/roles';
import { handleApiError } from '@/lib/errors/api-handler';
import type { AppRole } from '@/lib/db/schema';

// 사용자 목록 조회
export async function GET() {
  try {
    const auth = await requireRole('admin');
    if (auth instanceof NextResponse) return auth;

    const users = await profileRepository.findAll();
    return NextResponse.json({
      success: true,
      data: users.map((u) => ({
        id: u.id,
        loginId: u.loginId,
        name: u.name,
        phone: u.phone,
        department: u.department,
        role: u.role,
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

// 사용자 등록 (관리자만)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole('admin');
    if (auth instanceof NextResponse) return auth;

    const { loginId, password, passwordConfirm, name, phone, department, role } = await request.json();

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

    // 역할 검증 (super_admin 할당 불가)
    const assignRole: AppRole = role && ASSIGNABLE_ROLES.includes(role) ? role : 'viewer';

    // 로그인 ID 중복 확인
    const existing = await profileRepository.findByLoginId(loginId);
    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: 'ID_EXISTS', message: '이미 사용 중인 아이디입니다' } },
        { status: 409 },
      );
    }

    const id = uuidv4();
    const passwordHash = await hashPassword(password);

    const created = await profileRepository.create({
      id,
      loginId,
      passwordHash,
      name,
      phone: phone ?? '',
      department: department ?? '',
      role: assignRole,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: created?.id,
        loginId: created?.loginId,
        name: created?.name,
        role: created?.role,
      },
    }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
