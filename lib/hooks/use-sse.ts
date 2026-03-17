'use client';

import { useState, useCallback } from 'react';

interface SSEState<T> {
  isLoading: boolean;
  progress: number;
  step: string;
  result: T | null;
  error: string | null;
}

export function useSSE<T = unknown>() {
  const [state, setState] = useState<SSEState<T>>({
    isLoading: false,
    progress: 0,
    step: '',
    result: null,
    error: null,
  });

  const execute = useCallback(async (url: string, options?: RequestInit) => {
    setState({ isLoading: true, progress: 0, step: '시작...', result: null, error: null });

    try {
      const response = await fetch(url, { method: 'POST', ...options });

      if (!response.ok || !response.body) {
        setState((prev) => ({ ...prev, isLoading: false, error: '요청에 실패했습니다' }));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'progress') {
              setState((prev) => ({
                ...prev,
                progress: event.data.progress ?? prev.progress,
                step: event.data.step ?? prev.step,
              }));
            } else if (event.type === 'complete') {
              setState((prev) => ({
                ...prev,
                isLoading: false,
                progress: 100,
                step: '완료',
                result: event.data.result as T,
              }));
            } else if (event.type === 'error') {
              setState((prev) => ({
                ...prev,
                isLoading: false,
                error: event.data.error?.message ?? '오류가 발생했습니다',
              }));
            }
          } catch {
            // 파싱 실패 무시
          }
        }
      }
    } catch {
      setState((prev) => ({ ...prev, isLoading: false, error: '네트워크 오류가 발생했습니다' }));
    }
  }, []);

  return { ...state, execute };
}
