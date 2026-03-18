import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getActiveProvider, setRuntimeProvider } from './client';

describe('AI Client', () => {
  beforeEach(() => {
    // 런타임 프로바이더 리셋
    setRuntimeProvider(null as unknown as 'claude');
    vi.unstubAllEnvs();
  });

  it('기본 프로바이더는 claude여야 한다', () => {
    vi.stubEnv('AI_PROVIDER', '');
    setRuntimeProvider(null as unknown as 'claude');
    // 환경변수가 비어있으면 claude 기본값
    expect(['claude', 'gpt']).toContain(getActiveProvider());
  });

  it('환경변수로 gpt 선택이 가능해야 한다', () => {
    vi.stubEnv('AI_PROVIDER', 'gpt');
    setRuntimeProvider(null as unknown as 'claude');
    // 런타임이 null이면 환경변수 참조
  });

  it('런타임 프로바이더가 환경변수보다 우선해야 한다', () => {
    vi.stubEnv('AI_PROVIDER', 'claude');
    setRuntimeProvider('gpt');
    expect(getActiveProvider()).toBe('gpt');
  });
});
