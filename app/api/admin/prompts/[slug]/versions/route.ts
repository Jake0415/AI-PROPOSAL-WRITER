import { NextRequest, NextResponse } from 'next/server';
import { promptTemplateRepository } from '@/lib/repositories/prompt-template.repository';
import { requireRole } from '@/lib/auth/with-auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const auth = await requireRole('admin');
    if (auth instanceof NextResponse) return auth;

    const { slug } = await params;
    const template = await promptTemplateRepository.findBySlug(slug);

    if (!template) {
      return NextResponse.json({ success: true, data: [] });
    }

    const versions = await promptTemplateRepository.getVersions(template.id);
    return NextResponse.json({ success: true, data: versions });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: '버전 이력 조회에 실패했습니다' } },
      { status: 500 },
    );
  }
}
