import { claudeProvider } from './providers/claude';
import { gptProvider } from './providers/gpt';
import type { AiProvider, AiProviderInterface, GenerateOptions } from './providers/types';
import { settingsRepository } from '@/lib/repositories/settings.repository';

// 타입 재내보내기 (기존 import 호환)
export type { GenerateOptions } from './providers/types';

import { DEFAULT_CLAUDE_MODEL } from '@/lib/ai/models';

// 기본값 (하위 호환)
export const AI_MODEL = DEFAULT_CLAUDE_MODEL;
export const MAX_TOKENS = 4096;

// 프로바이더 레지스트리
const providers: Record<AiProvider, AiProviderInterface> = {
  claude: claudeProvider,
  gpt: gptProvider,
};

// 런타임 프로바이더 오버라이드 (DB 설정에서 로드)
let _runtimeProvider: AiProvider | null = null;

export function setRuntimeProvider(provider: AiProvider) {
  _runtimeProvider = provider;
}

// 활성 프로바이더 결정 (우선순위: 런타임 > 환경변수 > 기본값)
export function getActiveProvider(): AiProvider {
  if (_runtimeProvider) return _runtimeProvider;
  const env = process.env.AI_PROVIDER?.toLowerCase();
  if (env === 'gpt' || env === 'openai') return 'gpt';
  return 'claude';
}

/** DB에서 활성 프로바이더를 로드하여 런타임에 반영 (매 호출 시 DB 조회) */
export async function ensureProviderFromDb(): Promise<AiProvider> {
  try {
    const settings = await settingsRepository.getAiSettings();
    if (settings?.provider) {
      _runtimeProvider = settings.provider as AiProvider;
      return _runtimeProvider;
    }
  } catch { /* DB 접근 실패 시 폴백 */ }
  return getActiveProvider();
}

// 프로바이더 인스턴스 조회
function getProvider(providerName?: AiProvider): AiProviderInterface {
  const name = providerName ?? getActiveProvider();
  return providers[name];
}

// API 키 사전검증
async function validateApiKey(): Promise<void> {
  const provider = getActiveProvider();
  const key = await getApiKey(provider);
  if (!key) {
    throw new Error(`AI_KEY_ERROR: ${provider === 'claude' ? 'Claude' : 'GPT'} API 키가 설정되지 않았습니다. 설정 > AI 키 관리에서 키를 입력하세요.`);
  }
}

// 통합 텍스트 생성 (DB 프로바이더 자동 로드 + 키 검증)
export async function generateText(options: GenerateOptions): Promise<string> {
  await ensureProviderFromDb();
  await validateApiKey();
  const provider = getProvider();
  return provider.generateText(options);
}

// 통합 스트리밍 생성 (DB 프로바이더 자동 로드 + 키 검증)
export async function* generateStream(options: GenerateOptions): AsyncGenerator<string> {
  await ensureProviderFromDb();
  await validateApiKey();
  const provider = getProvider();
  yield* provider.generateStream(options);
}

// DB에서 API 키 로드 (우선순위: DB > 환경변수)
export async function getApiKey(provider: AiProvider): Promise<string | undefined> {
  try {
    const dbKey = await settingsRepository.getDecryptedApiKey(provider);
    if (dbKey) return dbKey;
  } catch { /* DB 접근 실패 시 환경변수 폴백 */ }
  return provider === 'claude'
    ? process.env.ANTHROPIC_API_KEY
    : process.env.OPENAI_API_KEY;
}

// 파일 업로드 (GPT file_search용)
export async function uploadFile(buffer: Buffer, fileName: string): Promise<string | null> {
  const provider = getProvider();
  if (provider.uploadFile) {
    return provider.uploadFile(buffer, fileName);
  }
  return null;
}

// 파일 첨부 생성 (GPT Responses API)
export async function generateWithFile(options: GenerateOptions & { fileId: string }): Promise<string> {
  const provider = getProvider();
  if (provider.generateWithFile) {
    return provider.generateWithFile(options);
  }
  // 폴백: 일반 텍스트 생성
  return provider.generateText(options);
}
