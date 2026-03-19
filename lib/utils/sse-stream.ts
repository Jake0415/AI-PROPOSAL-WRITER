/**
 * SSE 스트리밍 응답을 생성하는 유틸리티.
 * 서비스 레이어의 비동기 작업을 SSE로 래핑합니다.
 */

export interface SSEProgress {
  step: string;
  progress: number;
  stepIndex?: number;
  totalSteps?: number;
  steps?: string[];
}

export function createSSEResponse<T>(
  executor: (onProgress: (p: SSEProgress) => void) => Promise<T>,
  errorCode: string,
  errorMessage: string,
): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(type: string, data: object) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`),
        );
      }

      try {
        const result = await executor((p) => send('progress', p));
        send('complete', { result });
      } catch (err) {
        const message = err instanceof Error ? err.message : errorMessage;
        send('error', { error: { code: errorCode, message } });
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
