import { NextResponse } from 'next/server';
import { getSessionFromCookies } from './session';
import { profileRepository } from '@/lib/repositories/profile.repository';
import { isRoleAtLeast } from './roles';
import type { AppRole } from '@/lib/db/schema';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: AppRole;
}

// API 라우트에서 인증된 사용자 요구
export async function requireAuth(): Promise<AuthenticatedUser | NextResponse> {
  const session = await getSessionFromCookies();

  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
      { status: 401 },
    );
  }

  const profile = await profileRepository.findByUserId(session.userId);
  return {
    id: session.userId,
    email: session.email,
    role: (profile?.role as AppRole) ?? 'viewer',
  };
}

// 특정 역할 이상 요구
export async function requireRole(minRole: AppRole): Promise<AuthenticatedUser | NextResponse> {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;

  if (!isRoleAtLeast(result.role, minRole)) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } },
      { status: 403 },
    );
  }

  return result;
}
