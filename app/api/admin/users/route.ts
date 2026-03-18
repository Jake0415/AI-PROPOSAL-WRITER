import { NextRequest, NextResponse } from 'next/server';
import { profileRepository } from '@/lib/repositories/profile.repository';
import { requireRole } from '@/lib/auth/with-auth';
import { handleApiError } from '@/lib/errors/api-handler';

export async function GET(_request: NextRequest) {
  try {
    const auth = await requireRole('admin');
    if (auth instanceof NextResponse) return auth;

    const users = await profileRepository.findAll();
    return NextResponse.json({ success: true, data: users });
  } catch (err) {
    return handleApiError(err);
  }
}
