import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import { getPrompt } from '@/lib/services/prompt.service';

// 유효한 코칭 대상 단계
const VALID_STEPS = ['analysis', 'direction', 'strategy', 'outline'] as const;
type CoachingStep = (typeof VALID_STEPS)[number];

function isValidStep(step: string): step is CoachingStep {
  return (VALID_STEPS as readonly string[]).includes(step);
}

// 단계별 데이터 조회
async function getStepData(
  projectId: string,
  stepKey: CoachingStep,
): Promise<string | null> {
  switch (stepKey) {
    case 'analysis': {
      const analysis = await rfpRepository.getAnalysisByProjectId(projectId);
      if (!analysis) return null;
      return JSON.stringify({
        overview: analysis.overview,
        requirements: analysis.requirements,
        evaluationCriteria: analysis.evaluationCriteria,
        scope: analysis.scope,
        constraints: analysis.constraints,
        keywords: analysis.keywords,
      });
    }
    case 'direction': {
      const direction = await proposalRepository.getDirection(projectId);
      if (!direction) return null;
      const analysis = await rfpRepository.getAnalysisByProjectId(projectId);
      return JSON.stringify({
        candidates: direction.candidates,
        selectedIndex: direction.selectedIndex,
        analysisOverview: analysis ? analysis.overview : null,
      });
    }
    case 'strategy': {
      const strategy = await proposalRepository.getStrategy(projectId);
      if (!strategy) return null;
      return JSON.stringify({
        competitiveStrategy: strategy.competitiveStrategy,
        differentiators: strategy.differentiators,
        keyMessages: strategy.keyMessages,
      });
    }
    case 'outline': {
      const outline = await proposalRepository.getOutline(projectId);
      if (!outline) return null;
      const analysis = await rfpRepository.getAnalysisByProjectId(projectId);
      return JSON.stringify({
        sections: outline.sections,
        evaluationCriteria: analysis ? analysis.evaluationCriteria : [],
      });
    }
    default:
      return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  let body: { stepKey?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_BODY', message: '요청 본문이 올바르지 않습니다' } },
      { status: 400 },
    );
  }

  const { stepKey } = body;
  if (!stepKey || !isValidStep(stepKey)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_STEP', message: '유효하지 않은 단계입니다' } },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(type: string, data: Record<string, unknown>) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`),
        );
      }

      try {
        send('progress', { step: '데이터 조회 중', progress: 10 });

        // 단계별 데이터 조회
        const stepData = await getStepData(projectId, stepKey);
        if (!stepData) {
          send('error', {
            error: { code: 'NO_DATA', message: '해당 단계의 데이터가 없습니다. 먼저 해당 단계를 완료해주세요.' },
          });
          controller.close();
          return;
        }

        send('progress', { step: 'AI 코칭 분석 중', progress: 30 });

        // AI 코칭 실행
        const prompt = await getPrompt('coaching');
        const result = await generateText({
          systemPrompt: prompt.systemPrompt,
          userPrompt: prompt.buildUserPrompt(stepKey, stepData),
          maxTokens: prompt.maxTokens,
        });

        send('progress', { step: '결과 처리 중', progress: 80 });

        // JSON 파싱
        let coachingResult;
        try {
          const jsonMatch = result.match(/\{[\s\S]*\}/);
          coachingResult = jsonMatch
            ? JSON.parse(jsonMatch[0])
            : JSON.parse(result);
        } catch {
          coachingResult = {
            overallScore: 0,
            summary: 'AI 코칭 결과를 파싱하는 데 실패했습니다. 다시 시도해주세요.',
            feedback: [],
          };
        }

        send('progress', { step: '완료', progress: 100 });
        send('complete', { result: coachingResult });
      } catch {
        send('error', {
          error: { code: 'COACHING_ERROR', message: 'AI 코칭 중 오류가 발생했습니다' },
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
