/**
 * AI 모델 목록 중앙 관리
 * 새 모델 추가 시 이 파일만 수정하면 설정 페이지/프로바이더/시드에 모두 반영됩니다.
 */

export interface ModelInfo {
  id: string;
  name: string;
  isDefault?: boolean;
}

export const CLAUDE_MODELS: ModelInfo[] = [
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', isDefault: true },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5' },
];

export const GPT_MODELS: ModelInfo[] = [
  { id: 'gpt-5.4-mini', name: 'GPT-5.4 mini', isDefault: true },
  { id: 'gpt-5.4', name: 'GPT-5.4' },
  { id: 'gpt-5.4-pro', name: 'GPT-5.4 Pro' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 mini' },
  { id: 'gpt-4.1', name: 'GPT-4.1' },
  { id: 'gpt-4o', name: 'GPT-4o (레거시)' },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini (레거시)' },
];

export const DEFAULT_CLAUDE_MODEL = CLAUDE_MODELS.find(m => m.isDefault)!.id;
export const DEFAULT_GPT_MODEL = GPT_MODELS.find(m => m.isDefault)!.id;

/** GPT-5.x 이상 모델 여부 판별 (max_completion_tokens 필요) */
export function isGpt5Model(modelId: string): boolean {
  return /^gpt-5/.test(modelId);
}
