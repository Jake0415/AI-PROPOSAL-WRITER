import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import {
  SECTION_SYSTEM_PROMPT,
  buildSectionPrompt,
} from '@/lib/ai/prompts/section-generation';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> },
) {
  const { id: projectId, sectionId } = await params;

  try {
    // 기존 섹션 조회
    const sections = await proposalRepository.getSectionsByProject(projectId);
    const section = sections.find((s) => s.id === sectionId);
    if (!section) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '섹션을 찾을 수 없습니다' } },
        { status: 404 },
      );
    }

    // 데이터 로드
    const [analysis, strategy, outline] = await Promise.all([
      rfpRepository.getAnalysisByProjectId(projectId),
      proposalRepository.getStrategy(projectId),
      proposalRepository.getOutline(projectId),
    ]);

    if (!analysis || !strategy || !outline) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_DATA', message: '필요 데이터가 없습니다' } },
        { status: 400 },
      );
    }

    const analysisJson = JSON.stringify({
      overview: JSON.parse(analysis.overview),
      requirements: JSON.parse(analysis.requirements),
      evaluationCriteria: JSON.parse(analysis.evaluationCriteria),
    });
    const strategyJson = JSON.stringify({
      competitiveStrategy: strategy.competitiveStrategy,
      differentiators: JSON.parse(strategy.differentiators),
      keyMessages: JSON.parse(strategy.keyMessages),
    });

    // AI 재생성
    const result = await generateText({
      systemPrompt: SECTION_SYSTEM_PROMPT,
      userPrompt: buildSectionPrompt(
        section.title,
        section.sectionPath,
        analysisJson,
        strategyJson,
        outline.sections,
      ),
      maxTokens: 4096,
    });

    // JSON 파싱
    let sectionData: { content: string; diagrams: string[] };
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      sectionData = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : JSON.parse(result);
    } catch {
      sectionData = { content: result.slice(0, 3000), diagrams: [] };
    }

    // DB 업데이트
    await proposalRepository.updateSection(sectionId, {
      content: sectionData.content ?? '',
      diagrams: JSON.stringify(sectionData.diagrams ?? []),
      status: 'generated',
    });

    return NextResponse.json({
      success: true,
      data: {
        id: sectionId,
        content: sectionData.content,
        diagrams: sectionData.diagrams,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'REGENERATE_ERROR', message: '섹션 재생성에 실패했습니다' } },
      { status: 500 },
    );
  }
}
