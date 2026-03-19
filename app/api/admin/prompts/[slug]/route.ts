import { NextRequest, NextResponse } from 'next/server';
import { promptTemplateRepository } from '@/lib/repositories/prompt-template.repository';
import { getDefaultPrompt } from '@/lib/ai/prompts/defaults';
import { updatePrompt, resetToDefault } from '@/lib/services/prompt.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const dbTemplate = await promptTemplateRepository.findBySlug(slug);
    const defaultDef = getDefaultPrompt(slug);

    if (!dbTemplate && !defaultDef) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '프롬프트를 찾을 수 없습니다' } },
        { status: 404 },
      );
    }

    const data = dbTemplate
      ? {
          ...dbTemplate,
          source: 'db' as const,
          defaultSystemPrompt: defaultDef?.systemPrompt ?? null,
        }
      : {
          slug: defaultDef!.slug,
          name: defaultDef!.name,
          description: defaultDef!.description,
          category: defaultDef!.category,
          systemPrompt: defaultDef!.systemPrompt,
          userPromptTemplate: '',
          maxTokens: defaultDef!.maxTokens,
          version: 1,
          isActive: true,
          source: 'default' as const,
          defaultSystemPrompt: defaultDef!.systemPrompt,
        };

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: '프롬프트 조회에 실패했습니다' } },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const { systemPrompt, userPromptTemplate, maxTokens, changeNote } = body;

    if (!systemPrompt) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_FIELDS', message: 'System Prompt는 필수입니다' } },
        { status: 400 },
      );
    }

    const updated = await updatePrompt(slug, {
      systemPrompt,
      userPromptTemplate: userPromptTemplate ?? '',
      maxTokens: maxTokens ?? 4096,
      changeNote,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : '프롬프트 수정에 실패했습니다';
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message } },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    await resetToDefault(slug);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_ERROR', message: '기본값 복원에 실패했습니다' } },
      { status: 500 },
    );
  }
}
