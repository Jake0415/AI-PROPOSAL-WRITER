import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { getPrompt } from '@/lib/services/prompt.service';
import type { CompetitiveAnalysisResult } from '@/lib/ai/types';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  try {
    const analysis = await rfpRepository.getAnalysisByProjectId(projectId);
    if (!analysis) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_ANALYSIS', message: '분석 결과가 없습니다' } },
        { status: 400 },
      );
    }

    const analysisJson = JSON.stringify({
      overview: analysis.overview,
      requirements: analysis.requirements,
      evaluationItems: analysis.evaluationItems,
      keywords: analysis.keywords,
    });

    const prompt = await getPrompt('competitive-analysis');
    const result = await generateText({
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.buildUserPrompt(analysisJson),
      maxTokens: prompt.maxTokens,
    });

    let data: CompetitiveAnalysisResult;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
    } catch {
      data = {
        swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
        competitors: [],
        differentiationStrategy: '',
        riskFactors: [],
      };
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '경쟁 분석에 실패했습니다';
    return NextResponse.json(
      { success: false, error: { code: 'COMPETITIVE_ERROR', message } },
      { status: 500 },
    );
  }
}
