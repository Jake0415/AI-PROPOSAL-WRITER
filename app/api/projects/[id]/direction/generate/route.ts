import { NextRequest } from 'next/server';
import { generateText } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import { projectRepository } from '@/lib/repositories/project.repository';
import {
  DIRECTION_SYSTEM_PROMPT,
  buildDirectionPrompt,
} from '@/lib/ai/prompts/direction-generation';

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
        send('progress', { step: '분석 결과 로딩', progress: 10 });

        const analysis = await rfpRepository.getAnalysisByProjectId(projectId);
        if (!analysis) {
          send('error', { error: { code: 'NO_ANALYSIS', message: '분석 결과가 없습니다' } });
          controller.close();
          return;
        }

        send('progress', { step: '방향성 생성 중', progress: 30 });

        const analysisJson = JSON.stringify({
          overview: JSON.parse(analysis.overview),
          requirements: JSON.parse(analysis.requirements),
          evaluationCriteria: JSON.parse(analysis.evaluationCriteria),
          keywords: JSON.parse(analysis.keywords),
        });

        const result = await generateText({
          systemPrompt: DIRECTION_SYSTEM_PROMPT,
          userPrompt: buildDirectionPrompt(analysisJson),
          maxTokens: 4096,
        });

        send('progress', { step: '결과 저장', progress: 80 });

        let candidates: string;
        try {
          const jsonMatch = result.match(/\{[\s\S]*\}/);
          const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
          candidates = JSON.stringify(parsed.candidates ?? []);
        } catch {
          candidates = '[]';
        }

        await proposalRepository.createDirection(projectId, candidates);

        send('progress', { step: '완료', progress: 100 });
        send('complete', { result: JSON.parse(candidates) });
      } catch {
        send('error', { error: { code: 'DIRECTION_ERROR', message: '방향성 생성에 실패했습니다' } });
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
