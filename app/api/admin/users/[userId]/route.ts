import { NextRequest, NextResponse } from 'next/server';
import { profileRepository } from '@/lib/repositories/profile.repository';
import { requireRole } from '@/lib/auth/with-auth';
import { handleApiError } from '@/lib/errors/api-handler';
import { ASSIGNABLE_ROLES } from '@/lib/auth/roles';
import { hashPassword } from '@/lib/auth/password';
import type { AppRole } from '@/lib/db/schema';

// 사용자 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const auth = await requireRole('admin');
    if (auth instanceof NextResponse) return auth;

    const { userId } = await params;
    const body = await request.json();
    const { role, name, phone, department, password } = body;

    const updateData: Record<string, unknown> = {};

    if (role) {
      if (!ASSIGNABLE_ROLES.includes(role as AppRole)) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION', message: '유효한 역할이 필요합니다' } },
          { status: 400 },
        );
      }
      updateData.role = role;
    }

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (department !== undefined) updateData.department = department;
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: { code: 'WEAK_PASSWORD', message: '비밀번호는 6자 이상이어야 합니다' } },
          { status: 400 },
        );
      }
      updateData.passwordHash = await hashPassword(password);
    }

    await profileRepository.update(userId, updateData);
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}

// 사용자 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const auth = await requireRole('admin');
    if (auth instanceof NextResponse) return auth;

    const { userId } = await params;

    // 자기 자신 삭제 방지
    if (auth.id === userId) {
      return NextResponse.json(
        { success: false, error: { code: 'SELF_DELETE', message: '자기 자신은 삭제할 수 없습니다' } },
        { status: 400 },
      );
    }

    // super_admin 삭제 방지
    const target = await profileRepository.findByUserId(userId);
    if (target?.role === 'super_admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '최고관리자는 삭제할 수 없습니다' } },
        { status: 403 },
      );
    }

    await profileRepository.deleteUser(userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
