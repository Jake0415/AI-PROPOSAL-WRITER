import { NextRequest, NextResponse } from 'next/server';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import type { OutlineSection } from '@/lib/ai/types';

/** 기존 데이터 호환: level이 1-based면 0-based로, title에서 번호 패턴 제거 */
function migrateSections(sections: OutlineSection[]): OutlineSection[] {
  const needsMigration = sections.length > 0 && sections[0].level >= 1
    && !sections.some(s => s.level === 0);

  if (!needsMigration) return sections;

  function fix(items: OutlineSection[], offset: number): OutlineSection[] {
    return items.map((s) => ({
      ...s,
      title: s.title.replace(/^\d+[\.\-]\s*/, ''),
      level: s.level - offset,
      children: s.children?.length ? fix(s.children, offset) : [],
    }));
  }

  const minLevel = Math.min(...sections.map(s => s.level));
  return fix(sections, minLevel);
}

// 목차 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;
  try {
    const outline = await proposalRepository.getOutline(projectId);
    if (!outline) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '목차가 없습니다' } },
        { status: 404 },
      );
    }

    const rawSections = typeof outline.sections === 'string'
      ? JSON.parse(outline.sections as string)
      : outline.sections;
    const sections = migrateSections(rawSections ?? []);

    return NextResponse.json({
      success: true,
      data: {
        id: outline.id,
        sections,
        totalPages: (outline as Record<string, unknown>).totalPages ?? 100,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: '목차를 불러올 수 없습니다' } },
      { status: 500 },
    );
  }
}

// 목차 수정 (드래그앤드롭 순서 변경)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;
  try {
    const body = await request.json();
    const { sections, totalPages } = body as { sections: OutlineSection[]; totalPages?: number };

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'sections 배열이 필요합니다' } },
        { status: 400 },
      );
    }

    const outline = await proposalRepository.getOutline(projectId);
    if (!outline) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '목차가 없습니다' } },
        { status: 404 },
      );
    }

    await proposalRepository.updateOutline(outline.id, sections, totalPages);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: '목차 수정에 실패했습니다' } },
      { status: 500 },
    );
  }
}
