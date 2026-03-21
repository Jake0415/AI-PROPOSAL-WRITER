import { NextResponse } from 'next/server';
import { promptTemplateRepository } from '@/lib/repositories/prompt-template.repository';
import { getAllDefaultPrompts } from '@/lib/ai/prompts/defaults';
import { requireRole } from '@/lib/auth/with-auth';

export async function GET() {
  try {
    const auth = await requireRole('admin');
    if (auth instanceof NextResponse) return auth;
    const dbTemplates = await promptTemplateRepository.findAll();
    const defaults = getAllDefaultPrompts();

    // DB 템플릿과 기본값을 병합
    const dbSlugs = new Set(dbTemplates.map((t) => t.slug));
    const merged = [
      ...dbTemplates.map((t) => ({
        slug: t.slug,
        name: t.name,
        description: t.description,
        category: t.category,
        maxTokens: t.maxTokens,
        version: t.version,
        isActive: t.isActive,
        source: 'db' as const,
        updatedAt: t.updatedAt,
      })),
      ...defaults
        .filter((d) => !dbSlugs.has(d.slug))
        .map((d) => ({
          slug: d.slug,
          name: d.name,
          description: d.description,
          category: d.category,
          maxTokens: d.maxTokens,
          version: 1,
          isActive: true,
          source: 'default' as const,
          updatedAt: null,
        })),
    ];

    return NextResponse.json({ success: true, data: merged });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: '프롬프트 목록 조회에 실패했습니다' } },
      { status: 500 },
    );
  }
}
