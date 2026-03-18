import { describe, it, expect } from 'vitest';
import type { AiProvider, GenerateOptions } from './types';

describe('AI Provider Types', () => {
  it('AiProvider 타입이 claude와 gpt를 포함해야 한다', () => {
    const providers: AiProvider[] = ['claude', 'gpt'];
    expect(providers).toHaveLength(2);
    expect(providers).toContain('claude');
    expect(providers).toContain('gpt');
  });

  it('GenerateOptions 인터페이스가 올바른 구조를 가져야 한다', () => {
    const options: GenerateOptions = {
      systemPrompt: '테스트 시스템 프롬프트',
      userPrompt: '테스트 사용자 프롬프트',
      model: 'test-model',
      maxTokens: 100,
    };
    expect(options.systemPrompt).toBe('테스트 시스템 프롬프트');
    expect(options.maxTokens).toBe(100);
  });

  it('GenerateOptions에서 model, maxTokens는 선택 필드여야 한다', () => {
    const options: GenerateOptions = {
      systemPrompt: '시스템',
      userPrompt: '사용자',
    };
    expect(options.model).toBeUndefined();
    expect(options.maxTokens).toBeUndefined();
  });
});
