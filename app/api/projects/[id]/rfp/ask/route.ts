import { NextRequest } from 'next/server';
import { generateStream, ensureProviderFromDb, getActiveProvider } from '@/lib/ai/client';
import { getPrompt } from '@/lib/services/prompt.service';
import { buildRfpAskPrompt } from '@/lib/ai/prompts/rfp-ask';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  const body = await request.json();
  const question = (body.question ?? '').trim();
  const history: Array<{ role: string; content: string }> = body.history ?? [];

  if (!question) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'BAD_REQUEST', message: '질문을 입력하세요' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  await ensureProviderFromDb();

  // RAG 검색
  let ragContext = '관련 내용을 찾을 수 없습니다.';
  let visionContext = '';

  try {
    const { ragSearch } = await import('@/lib/vector/rag.service');
    const ragResult = await ragSearch(projectId, question);

    if (ragResult.chunks.length > 0) {
      ragContext = ragResult.chunks.map(c =>
        `[Page ${c.pageNumber}] ${c.text}`,
      ).join('\n\n');
    }

    // 이미지 매칭 → on-demand Vision
    if (ragResult.imageMatches.length > 0 && getActiveProvider() === 'gpt') {
      const matchedPaths = ragResult.imageMatches.map(m => m.imagePath).filter(Boolean);
      if (matchedPaths.length > 0) {
        try {
          const { analyzeImagesOnDemand } = await import('@/lib/vector/pdf-image.service');
          const visionResults = await analyzeImagesOnDemand(matchedPaths);
          if (visionResults.length > 0) {
            visionContext = visionResults.map(v =>
              `[이미지 분석]: ${v.description} (키워드: ${v.keywords.join(', ')})`,
            ).join('\n');
          }
        } catch { /* Vision 실패 시 텍스트만 */ }
      }
    }
  } catch { /* RAG 실패 시 빈 컨텍스트 */ }

  // 대화 이력 포맷
  const historyText = history.slice(-10).map(m =>
    `[${m.role === 'user' ? '사용자' : 'AI'}]: ${m.content}`,
  ).join('\n\n');

  // 프롬프트 구성
  const prompt = await getPrompt('rfp-ask');
  const userPrompt = buildRfpAskPrompt(question, ragContext, visionContext, historyText);

  // SSE 스트리밍 응답
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const gen = generateStream({
          systemPrompt: prompt.systemPrompt,
          userPrompt,
          maxTokens: prompt.maxTokens,
        });

        for await (const chunk of gen) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`));
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
      } catch (err) {
        const message = err instanceof Error ? err.message : '답변 생성에 실패했습니다';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message })}\n\n`));
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
