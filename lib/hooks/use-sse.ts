'use client';

import { useState, useCallback } from 'react';

export interface SSEStepInfo {
  label: string;
  status: 'pending' | 'active' | 'complete';
}

interface SSEState<T> {
  isLoading: boolean;
  progress: number;
  step: string;
  result: T | null;
  error: string | null;
  steps: SSEStepInfo[];
  stepIndex: number;
  totalSteps: number;
}

export function useSSE<T = unknown>() {
  const [state, setState] = useState<SSEState<T>>({
    isLoading: false,
    progress: 0,
    step: '',
    result: null,
    error: null,
    steps: [],
    stepIndex: -1,
    totalSteps: 0,
  });

  const execute = useCallback(async (url: string, options?: RequestInit) => {
    setState({
      isLoading: true,
      progress: 0,
      step: '시작...',
      result: null,
      error: null,
      steps: [],
      stepIndex: -1,
      totalSteps: 0,
    });

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
              setState((prev) => {
                const newStepIndex = event.data.stepIndex ?? prev.stepIndex;
                const newTotalSteps = event.data.totalSteps ?? prev.totalSteps;

                // steps 라벨 목록이 처음 전달되면 초기화
                let newSteps = prev.steps;
                if (event.data.steps && event.data.steps.length > 0 && prev.steps.length === 0) {
                  newSteps = event.data.steps.map((label: string) => ({
                    label,
                    status: 'pending' as const,
                  }));
                }

                // stepIndex 기반으로 상태 업데이트
                if (newSteps.length > 0 && newStepIndex >= 0) {
                  newSteps = newSteps.map((s: SSEStepInfo, i: number) => {
                    if (i < newStepIndex) return { ...s, status: 'complete' as const };
                    if (i === newStepIndex) return { ...s, status: 'active' as const };
                    return { ...s, status: 'pending' as const };
                  });
                }

                return {
                  ...prev,
                  progress: event.data.progress ?? prev.progress,
                  step: event.data.step ?? prev.step,
                  stepIndex: newStepIndex,
                  totalSteps: newTotalSteps,
                  steps: newSteps,
                };
              });
            } else if (event.type === 'complete') {
              setState((prev) => ({
                ...prev,
                isLoading: false,
                progress: 100,
                step: '완료',
                result: event.data.result as T,
                steps: prev.steps.map((s) => ({ ...s, status: 'complete' as const })),
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
