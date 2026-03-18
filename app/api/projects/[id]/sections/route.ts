import { NextRequest, NextResponse } from 'next/server';
import { proposalRepository } from '@/lib/repositories/proposal.repository';

// 프로젝트의 모든 섹션 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  try {
    const sections = await proposalRepository.getSectionsByProject(projectId);
    return NextResponse.json({ success: true, data: sections });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: '섹션 목록을 불러올 수 없습니다' } },
      { status: 500 },
    );
  }
}
