import { NextRequest } from 'next/server';
import { generateText } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { projectRepository } from '@/lib/repositories/project.repository';
import {
  RFP_ANALYSIS_SYSTEM_PROMPT,
  buildRfpAnalysisPrompt,
} from '@/lib/ai/prompts/rfp-analysis';

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
        // 프로젝트 상태 업데이트
        await projectRepository.updateStatus(projectId, 'analyzing');
        send('progress', { step: 'RFP 텍스트 로딩', progress: 10 });

        // RFP 텍스트 가져오기
        const rfpFile = await rfpRepository.getFileByProjectId(projectId);
        if (!rfpFile) {
          send('error', { error: { code: 'NO_RFP', message: 'RFP 파일이 없습니다' } });
          controller.close();
          return;
        }

        send('progress', { step: 'AI 분석 시작', progress: 30 });

        // AI 분석 실행
        const result = await generateText({
          systemPrompt: RFP_ANALYSIS_SYSTEM_PROMPT,
          userPrompt: buildRfpAnalysisPrompt(rfpFile.rawText),
          maxTokens: 8192,
        });

        send('progress', { step: '분석 결과 저장', progress: 80 });

        // JSON 파싱 시도
        let analysisData;
        try {
          const jsonMatch = result.match(/\{[\s\S]*\}/);
          analysisData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
        } catch {
          analysisData = {
            overview: { projectName: '분석 실패', summary: result.slice(0, 500) },
            requirements: [],
            evaluationCriteria: [],
            scope: { inScope: [], outOfScope: [] },
            constraints: { technical: [], business: [], timeline: [] },
            keywords: [],
          };
        }

        // DB 저장
        await rfpRepository.createAnalysis({
          projectId,
          overview: JSON.stringify(analysisData.overview ?? {}),
          requirements: JSON.stringify(analysisData.requirements ?? []),
          evaluationCriteria: JSON.stringify(analysisData.evaluationCriteria ?? []),
          scope: JSON.stringify(analysisData.scope ?? {}),
          constraints: JSON.stringify(analysisData.constraints ?? {}),
          keywords: JSON.stringify(analysisData.keywords ?? []),
        });

        send('progress', { step: '완료', progress: 100 });
        send('complete', { result: analysisData });
      } catch {
        send('error', { error: { code: 'ANALYSIS_ERROR', message: 'RFP 분석에 실패했습니다' } });
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
