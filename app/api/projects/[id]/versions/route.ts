import { NextRequest, NextResponse } from 'next/server';
import { versionService } from '@/lib/services/version.service';

// POST - 현재 상태 버전 저장
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;
    const { label, createdBy } = await request.json();
    const version = await versionService.createSnapshot(projectId, label || '수동 저장', createdBy);
    return NextResponse.json({ success: true, data: version }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '버전 저장에 실패했습니다' } },
      { status: 500 },
    );
  }
}

// GET - 버전 목록
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;
    const versions = await versionService.listVersions(projectId);
    return NextResponse.json({ success: true, data: versions });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '버전 목록 조회에 실패했습니다' } },
      { status: 500 },
    );
  }
}
