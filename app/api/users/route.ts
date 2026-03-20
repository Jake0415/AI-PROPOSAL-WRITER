import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/with-auth';
import { profileRepository } from '@/lib/repositories/profile.repository';
import { handleApiError } from '@/lib/errors/api-handler';

// 사용자 목록 조회 (담당자 배정용, proposal_pm 이상)
export async function GET() {
  try {
    const auth = await requireRole('proposal_pm');
    if (auth instanceof NextResponse) return auth;

    const users = await profileRepository.findAll();
    return NextResponse.json({
      success: true,
      data: users.map((u) => ({
        id: u.id,
        loginId: u.loginId,
        name: u.name,
        department: u.department,
        avatarUrl: u.avatarUrl ?? null,
        role: u.role,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
