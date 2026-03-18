import { NextRequest, NextResponse } from 'next/server';
import { profileRepository } from '@/lib/repositories/profile.repository';
import { requireRole } from '@/lib/auth/with-auth';
import { handleApiError } from '@/lib/errors/api-handler';
import type { AppRole } from '@/lib/db/schema';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const auth = await requireRole('admin');
    if (auth instanceof NextResponse) return auth;

    const { userId } = await params;
    const body = await request.json();
    const { role } = body as { role: AppRole };

    if (!role || !['admin', 'proposal_pm', 'tech_writer', 'viewer'].includes(role)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: '유효한 역할이 필요합니다' } },
        { status: 400 },
      );
    }

    await profileRepository.updateRole(userId, role);
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
