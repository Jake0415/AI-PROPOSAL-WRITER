# Task 066: API Key 401 Error Handling & Seed Resilience

## Status: ✅ 완료
## Priority: HIGH (Production Blocker)
## Size: M (Medium)

## Problem Statement

RFP 분석 Step 실행 시 "401 invalid x-api-key" 에러가 발생한다.
Anthropic(Claude) API에서 반환하는 인증 에러로, 실제 사용자는 GPT provider를 사용 중이다.

### Root Cause Analysis

코드 흐름을 추적한 결과 **3가지 원인이 복합적으로 작용**:

1. **Provider 폴백 문제**: `ensureProviderFromDb()` (client.ts:37)에서 DB 조회 실패 시 `getActiveProvider()` → 기본값 `'claude'` 반환. 즉, DB에 `provider: 'gpt'`로 저장되어 있어도 DB 접근 실패 시 Claude로 폴백.

2. **Docker 재배포 시 DB 초기화**: `deploy:clean` 실행 시 볼륨이 초기화되면 `aiSettings` 테이블이 빈 상태. `settingsRepository.getAiSettings()` (settings.repository.ts:20)에서 새 레코드를 `provider: 'claude'`로 자동 생성. `seed-data.ts`도 `provider: 'claude'`를 기본값으로 삽입.

3. **ENCRYPTION_KEY 불일치**: Docker 재빌드 시 `.env` 파일의 `ENCRYPTION_KEY`가 바뀌면 기존 암호화된 API 키 복호화 실패. `getDecryptedApiKey()` (settings.repository.ts:59)에서 `decrypt()` 실패 시 `null` 반환 → 환경변수 폴백 → 환경변수도 없으면 `undefined` → Anthropic SDK가 기본 키 없이 호출 → 401.

### Error Flow

```
사용자: GPT 사용 의도
  → Docker 재배포 (DB 초기화)
  → seed-data.ts: provider='claude' 삽입
  → 분석 실행: ensureProviderFromDb() → DB에서 'claude' 로드
  → getApiKey('claude') → 복호화 실패 (ENCRYPTION_KEY 변경) → null
  → 환경변수 ANTHROPIC_API_KEY도 미설정
  → Claude SDK에 undefined apiKey → 401 invalid x-api-key
```

## Solution Design

### BE-1: seed-data.ts AI 설정 환경변수 기반 복원

**파일**: `scripts/seed-data.ts`

현재 (line 72): `provider: 'claude'` 하드코딩
변경: 환경변수 `AI_PROVIDER`에 따라 provider 결정

```typescript
// 환경변수에서 provider 결정 (기본값: claude)
const envProvider = process.env.AI_PROVIDER?.toLowerCase();
const defaultProvider = (envProvider === 'gpt' || envProvider === 'openai') ? 'gpt' : 'claude';

await db.insert(schema.aiSettings).values({
  id: 'default',
  provider: defaultProvider,
  claudeModel: 'claude-sonnet-4-6',
  gptModel: 'gpt-5.4-mini',
  ...(claudeKey && { claudeApiKey: claudeKey }),
  ...(gptKey && { gptApiKey: gptKey }),
});
```

### BE-2: ensureProviderFromDb() 에러 로깅 강화

**파일**: `lib/ai/client.ts`

현재 (line 45): `catch { /* DB 접근 실패 시 폴백 */ }` - 조용한 실패
변경: 경고 로그 추가 + 에러 구분

```typescript
export async function ensureProviderFromDb(): Promise<AiProvider> {
  if (_runtimeProvider) return _runtimeProvider;
  try {
    const settings = await settingsRepository.getAiSettings();
    if (settings?.provider) {
      _runtimeProvider = settings.provider as AiProvider;
      return _runtimeProvider;
    }
  } catch (err) {
    console.warn('[AI Client] DB provider 로드 실패, 환경변수 폴백:', err instanceof Error ? err.message : err);
  }
  return getActiveProvider();
}
```

### BE-3: API 키 검증 + 명확한 에러 메시지

**파일**: `lib/ai/client.ts`

`generateText()` 및 `generateStream()` 호출 전 API 키 유효성 사전 검증:

```typescript
export async function generateText(options: GenerateOptions): Promise<string> {
  const activeProvider = await ensureProviderFromDb();
  const apiKey = await getApiKey(activeProvider);

  if (!apiKey) {
    const providerLabel = activeProvider === 'claude' ? 'Anthropic' : 'OpenAI';
    throw new Error(
      `AI_KEY_NOT_CONFIGURED: ${providerLabel} API 키가 설정되지 않았습니다. ` +
      `설정 > AI 설정에서 API 키를 등록하세요.`
    );
  }

  const provider = getProvider();
  return provider.generateText(options);
}
```

동일하게 `generateStream()`에도 적용.

### BE-4: SSE 에러 응답에 에러 코드 구분

**파일**: `lib/utils/sse-stream.ts`

에러 메시지에서 401/키 관련 에러를 감지하여 구분된 코드 전송:

```typescript
// createSSEResponse 내부
catch (err) {
  const message = err instanceof Error ? err.message : errorMessage;
  const isKeyError = message.includes('AI_KEY_NOT_CONFIGURED') ||
                     message.includes('401') ||
                     message.includes('invalid x-api-key') ||
                     message.includes('Incorrect API key');
  const code = isKeyError ? 'AI_KEY_ERROR' : errorCode;
  send('error', { error: { code, message } });
}
```

### BE-5: 개별 Step API 에러 응답 개선

**파일**: `app/api/projects/[id]/rfp/analyze/step/[stepNumber]/route.ts`

401 에러 시 명확한 JSON 에러 반환:

```typescript
catch (err) {
  const message = err instanceof Error ? err.message : '분석 실패';
  const isKeyError = message.includes('AI_KEY_NOT_CONFIGURED') || message.includes('401');
  return NextResponse.json({
    success: false,
    error: {
      code: isKeyError ? 'AI_KEY_ERROR' : 'ANALYSIS_FAILED',
      message: isKeyError
        ? 'AI API 키가 설정되지 않았습니다. 설정 페이지에서 키를 확인하세요.'
        : message,
    },
  }, { status: isKeyError ? 401 : 500 });
}
```

### FE-1: AnalysisStepRunner 에러 메시지 개선

**파일**: `components/project/analysis-step-runner.tsx`

API 키 에러 시 설정 페이지 링크 포함 안내:

```tsx
{error && (
  <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">
    {error}
    {error.includes('API 키') && (
      <Link href="/settings" className="underline ml-1 font-medium">
        설정 페이지에서 확인
      </Link>
    )}
  </div>
)}
```

### FE-2: useSSE 훅 에러 코드 노출

**파일**: `lib/hooks/use-sse.ts`

SSE error 이벤트에서 `code` 필드를 state에 추가:

```typescript
interface SSEState<T> {
  // ... 기존 필드
  errorCode: string | null;  // 추가
}

// error 이벤트 처리
} else if (event.type === 'error') {
  setState((prev) => ({
    ...prev,
    isLoading: false,
    error: event.data.error?.message ?? '오류가 발생했습니다',
    errorCode: event.data.error?.code ?? null,
  }));
}
```

## File Changes

| 파일 | 변경 | 크기 |
|------|------|------|
| `scripts/seed-data.ts` | provider를 환경변수 기반 결정 | S |
| `lib/ai/client.ts` | API 키 사전검증 + 에러 로깅 | M |
| `lib/utils/sse-stream.ts` | 에러 코드 구분 | S |
| `lib/hooks/use-sse.ts` | errorCode 필드 추가 | S |
| `components/project/analysis-step-runner.tsx` | 에러 안내 개선 | S |
| API route (analyze step) | 401 응답 구분 | S |

## Test Cases

1. ENCRYPTION_KEY 변경 후 재배포 → seed가 새 키로 API 키 재암호화
2. DB에 AI 설정 없을 때 분석 실행 → "API 키 미설정" 에러 메시지
3. provider=gpt, OpenAI 키만 설정 → GPT로 정상 분석
4. provider=claude, Claude 키 없음 → 명확한 에러 + 설정 링크
5. SSE 스트리밍 중 401 에러 → errorCode='AI_KEY_ERROR' 전달

## Dependencies

- Task 057 (API 키 DB 관리) 완료 상태
- 기존 encrypt/decrypt 모듈 변경 없음
