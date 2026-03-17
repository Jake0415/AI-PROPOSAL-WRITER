import { NextRequest } from 'next/server';
import { generateText } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import { projectRepository } from '@/lib/repositories/project.repository';
import {
  STRATEGY_SYSTEM_PROMPT,
  buildStrategyPrompt,
} from '@/lib/ai/prompts/strategy-generation';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(type: string, data: Record<string, unknown>) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`),
        );
      }

      try {
        send('progress', { step: '데이터 로딩', progress: 10 });

        const analysis = await rfpRepository.getAnalysisByProjectId(projectId);
        const direction = await proposalRepository.getDirection(projectId);

        if (!analysis || !direction) {
          send('error', { error: { code: 'MISSING_DATA', message: '분석 결과 또는 방향성이 없습니다' } });
          controller.close();
          return;
        }

        send('progress', { step: '전략 수립 중', progress: 30 });

        const analysisJson = JSON.stringify({
          overview: JSON.parse(analysis.overview),
          requirements: JSON.parse(analysis.requirements),
          evaluationCriteria: JSON.parse(analysis.evaluationCriteria),
        });

        const candidates = JSON.parse(direction.candidates);
        const selected = candidates[direction.selectedIndex ?? 0];

        const result = await generateText({
          systemPrompt: STRATEGY_SYSTEM_PROMPT,
          userPrompt: buildStrategyPrompt(analysisJson, JSON.stringify(selected)),
          maxTokens: 4096,
        });

        send('progress', { step: '결과 저장', progress: 80 });

        let strategyData;
        try {
          const jsonMatch = result.match(/\{[\s\S]*\}/);
          strategyData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
        } catch {
          strategyData = { competitiveStrategy: result.slice(0, 500), differentiators: [], keyMessages: [] };
        }

        await proposalRepository.createStrategy(projectId, {
          competitiveStrategy: strategyData.competitiveStrategy ?? '',
          differentiators: JSON.stringify(strategyData.differentiators ?? []),
          keyMessages: JSON.stringify(strategyData.keyMessages ?? []),
        });

        await projectRepository.updateStatus(projectId, 'strategy_set');

        send('progress', { step: '완료', progress: 100 });
        send('complete', { result: strategyData });
      } catch {
        send('error', { error: { code: 'STRATEGY_ERROR', message: '전략 생성에 실패했습니다' } });
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
