import { NextRequest, NextResponse } from 'next/server';
import { projectMemberRepository } from '@/lib/repositories/project-member.repository';
import { requireRole } from '@/lib/auth/with-auth';
import { handleApiError } from '@/lib/errors/api-handler';
import type { ProjectRole } from '@/lib/db/schema';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRole('tech_writer');
    if (auth instanceof NextResponse) return auth;

    const { id: projectId } = await params;
    const members = await projectMemberRepository.getMembersWithProfile(projectId);
    return NextResponse.json({ success: true, data: members });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRole('proposal_pm');
    if (auth instanceof NextResponse) return auth;

    const { id: projectId } = await params;
    const body = await request.json();
    const { userId, role } = body as { userId: string; role?: ProjectRole };

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: 'userId가 필요합니다' } },
        { status: 400 },
      );
    }

    const member = await projectMemberRepository.addMember(projectId, userId, role ?? 'viewer');
    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
