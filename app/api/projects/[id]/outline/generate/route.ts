import { NextRequest } from 'next/server';
import { generateText } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import { projectRepository } from '@/lib/repositories/project.repository';
import {
  OUTLINE_SYSTEM_PROMPT,
  buildOutlinePrompt,
} from '@/lib/ai/prompts/outline-generation';

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
        const strategy = await proposalRepository.getStrategy(projectId);

        if (!analysis || !strategy) {
          send('error', { error: { code: 'MISSING_DATA', message: '분석 또는 전략 데이터가 없습니다' } });
          controller.close();
          return;
        }

        send('progress', { step: '목차 생성 중', progress: 30 });

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

        const result = await generateText({
          systemPrompt: OUTLINE_SYSTEM_PROMPT,
          userPrompt: buildOutlinePrompt(analysisJson, strategyJson),
          maxTokens: 4096,
        });

        send('progress', { step: '결과 저장', progress: 80 });

        let sections: string;
        try {
          const jsonMatch = result.match(/\{[\s\S]*\}/);
          const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
          sections = JSON.stringify(parsed.sections ?? []);
        } catch {
          sections = '[]';
        }

        await proposalRepository.createOutline(projectId, sections);
        await projectRepository.updateStatus(projectId, 'outline_ready');

        send('progress', { step: '완료', progress: 100 });
        send('complete', { result: JSON.parse(sections) });
      } catch {
        send('error', { error: { code: 'OUTLINE_ERROR', message: '목차 생성에 실패했습니다' } });
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
