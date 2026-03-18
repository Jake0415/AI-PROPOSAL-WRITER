import { NextRequest, NextResponse } from 'next/server';
import { projectMemberRepository } from '@/lib/repositories/project-member.repository';
import { requireRole } from '@/lib/auth/with-auth';
import { handleApiError } from '@/lib/errors/api-handler';
import type { ProjectRole } from '@/lib/db/schema';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  try {
    const auth = await requireRole('proposal_pm');
    if (auth instanceof NextResponse) return auth;

    const { memberId } = await params;
    const body = await request.json();
    const { role } = body as { role: ProjectRole };

    if (!role || !['owner', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: '유효한 역할이 필요합니다' } },
        { status: 400 },
      );
    }

    await projectMemberRepository.updateRole(memberId, role);
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  try {
    const auth = await requireRole('proposal_pm');
    if (auth instanceof NextResponse) return auth;

    const { id: projectId, memberId } = await params;
    await projectMemberRepository.removeMember(projectId, memberId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
