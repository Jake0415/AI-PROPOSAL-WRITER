# Task 067: Global Loading Modal Component

## Status: TODO
## Priority: HIGH (UX Critical)
## Size: L (Large)

## Problem Statement

오래 걸리는 AI 작업(RFP 분석, 벡터 생성, 방향성/전략 생성 등) 실행 중 사용자가 페이지를 이탈하거나 중복 실행하여 데이터 정합성이 깨지는 문제가 있다. 현재는 각 페이지에서 개별적으로 로딩 상태를 관리하고 있어 UX가 일관되지 않는다.

## Current State Analysis

### 기존 로딩 패턴 (페이지별 개별 구현)

| 페이지 | 로딩 방식 | 문제 |
|--------|----------|------|
| 분석 (analysis) | `AnalysisStepRunner` 내부 state | 페이지 이탈 가능, dim 없음 |
| 벡터 (vectorize) | `useSSE` + `ProgressTracker` | 프로그레스바만, 잠금 없음 |
| 방향성 (direction) | `useSSE` + `ProgressTracker` | 프로그레스바만, 잠금 없음 |
| 전략 (strategy) | `useSSE` + `ProgressTracker` | 프로그레스바만, 잠금 없음 |
| 섹션 생성 (sections) | `useSSE` + inline 로딩 | 개별 섹션만 잠금 |
| 가격 제안 (pricing) | `useSSE` + inline 로딩 | 개별 잠금 |
| 검토 (review) | `useSSE` + inline 로딩 | 개별 잠금 |

### 기존 인프라

- `useSSE<T>()` 훅: SSE 스트리밍 상태 관리 (isLoading, progress, step, steps, error)
- `SSEStepInfo`: { label, status: 'pending'|'active'|'complete' }
- `ProgressTracker`: 단순 프로그레스바 (progress %, step label)
- `createSSEResponse()`: 서버 SSE 래퍼

## Solution Design

### Architecture Overview

```
[LoadingModalProvider] (Context)
  └── [LoadingModal] (Portal, z-50)
       ├── Dim Backdrop (click 차단)
       ├── Title + Description
       ├── Step Stepper (vertical)
       ├── Progress Bar
       └── Error State + Action Button

[useLoadingModal()] → { open, close, updateProgress }
[useSSE()] → 기존 훅 (변경 없음)

[각 페이지] → useSSE() + useLoadingModal() 조합
```

### Component 1: LoadingModal

**파일**: `components/ui/loading-modal.tsx`

**Props Interface**:

```typescript
interface LoadingModalProps {
  open: boolean;
  title: string;                    // "RFP 분석 중..."
  description?: string;             // "7단계 순차 분석을 실행합니다"
  steps?: LoadingStep[];            // 단계별 스테퍼
  currentStepIndex?: number;        // 현재 활성 단계
  progress?: number;                // 0~100 전체 진행률
  error?: {                         // 에러 상태
    message: string;
    code?: string;
    action?: {                      // 에러 시 액션 버튼
      label: string;
      href?: string;                // 링크 이동 (예: /settings)
      onClick?: () => void;         // 콜백
    };
  };
  onCancel?: () => void;            // 취소 버튼 (optional)
  cancelLabel?: string;             // 취소 버튼 라벨
}

interface LoadingStep {
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  detail?: string;                  // 부가 설명 (optional)
}
```

**Visual Design**:

```
+------------------------------------------+
|  (dim backdrop - 전체 화면 커버)           |
|                                          |
|     +------------------------------+     |
|     |  RFP 분석 중...               |     |
|     |  7단계 순차 분석을 실행합니다    |     |
|     |                              |     |
|     |  [v] Step 1: 사업 개요 파악    |     |
|     |  [v] Step 2: 평가항목 추출     |     |
|     |  [>] Step 3: 요구사항 도출     |     |  ← spinner
|     |  [ ] Step 4: 추적성 매트릭스   |     |
|     |  [ ] Step 5: 자격요건/범위     |     |
|     |  [ ] Step 6: 배점 전략 분석    |     |
|     |  [ ] Step 7: 권장 목차        |     |
|     |                              |     |
|     |  [=========>        ] 43%     |     |
|     |  요구사항 도출 중...           |     |
|     |                              |     |
|     +------------------------------+     |
|                                          |
+------------------------------------------+
```

**Error State**:

```
+------------------------------+
|  RFP 분석 실패               |
|                              |
|  [v] Step 1: 사업 개요 파악   |
|  [v] Step 2: 평가항목 추출    |
|  [x] Step 3: 요구사항 도출    |  ← 빨간 X
|                              |
|  [!] AI API 키가 설정되지      |
|      않았습니다.              |
|                              |
|  [설정에서 확인]  [닫기]       |
+------------------------------+
```

### Component 2: LoadingModalProvider

**파일**: `components/providers/loading-modal-provider.tsx`

React Context로 앱 전역에서 모달 제어:

```typescript
interface LoadingModalContextValue {
  /** 모달 열기 */
  open: (config: {
    title: string;
    description?: string;
    steps?: string[];          // label 배열 (자동 LoadingStep 변환)
    cancelable?: boolean;
    onCancel?: () => void;
  }) => void;

  /** 진행률 업데이트 */
  updateProgress: (update: {
    progress?: number;
    currentStepIndex?: number;
    stepDetail?: string;
  }) => void;

  /** 에러 표시 */
  setError: (error: {
    message: string;
    code?: string;
    action?: { label: string; href?: string; onClick?: () => void };
  }) => void;

  /** 모달 닫기 */
  close: () => void;

  /** 현재 열린 상태 */
  isOpen: boolean;
}
```

### Component 3: useLoadingModal Hook

**파일**: `lib/hooks/use-loading-modal.ts`

```typescript
export function useLoadingModal() {
  const context = useContext(LoadingModalContext);
  if (!context) throw new Error('LoadingModalProvider 내부에서 사용하세요');
  return context;
}
```

### Integration Pattern: useSSE + useLoadingModal 조합

각 페이지에서 useSSE와 useLoadingModal을 조합하여 사용:

```typescript
// 예시: direction/page.tsx
const sse = useSSE<DirectionCandidate[]>();
const modal = useLoadingModal();

function startGeneration() {
  modal.open({
    title: '방향성 생성 중...',
    description: 'AI가 3가지 전략 방향을 분석합니다',
    steps: ['RFP 분석 결과 로드', '전략 후보 생성', '적합도 평가'],
  });
  sse.execute(`/api/projects/${projectId}/direction/generate`);
}

// SSE 상태 → 모달 동기화
useEffect(() => {
  if (sse.isLoading) {
    modal.updateProgress({
      progress: sse.progress,
      currentStepIndex: sse.stepIndex,
    });
  }
  if (sse.error) {
    const isKeyError = sse.errorCode === 'AI_KEY_ERROR';
    modal.setError({
      message: sse.error,
      code: sse.errorCode ?? undefined,
      action: isKeyError
        ? { label: '설정에서 확인', href: '/settings' }
        : { label: '닫기', onClick: () => modal.close() },
    });
  }
  if (sse.result) {
    modal.close();
  }
}, [sse.isLoading, sse.error, sse.result, sse.progress, sse.stepIndex]);
```

### Integration Pattern: Analysis Step Runner (non-SSE)

분석은 SSE가 아닌 개별 REST 호출이므로 별도 패턴:

```typescript
// analysis-step-runner.tsx
const modal = useLoadingModal();

async function runAllSteps() {
  modal.open({
    title: 'RFP 분석 중...',
    description: '7단계 순차 분석을 실행합니다',
    steps: STEP_LABELS.map(s => s.label),
  });

  for (const step of STEP_LABELS) {
    modal.updateProgress({
      currentStepIndex: step.num - 1,
      progress: Math.round((step.num / 7) * 100),
    });

    try {
      await runStep(step.num);  // 기존 함수
    } catch (err) {
      modal.setError({
        message: err instanceof Error ? err.message : '분석 실패',
        action: { label: '닫기', onClick: () => modal.close() },
      });
      return;
    }
  }

  modal.close();
  onComplete?.();
}
```

## Implementation Steps

### Step 1: LoadingModal UI 컴포넌트 (FE)

1. `components/ui/loading-modal.tsx` 생성
   - shadcn Dialog 기반 (closeOnOutsideClick: false, closeOnEsc: false)
   - Vertical step stepper (CheckCircle / Loader2 / Circle / XCircle 아이콘)
   - Progress bar (기존 스타일 재활용)
   - Error state with action button
   - 반응형 (모바일 fullscreen, 데스크톱 centered modal)

2. 다크 모드 지원
   - dim backdrop: `bg-black/60 dark:bg-black/70`
   - 모달: 기존 Card 스타일 활용

### Step 2: LoadingModalProvider (FE)

1. `components/providers/loading-modal-provider.tsx` 생성
2. `app/layout.tsx`에 Provider 추가 (ThemeProvider 내부)
3. `lib/hooks/use-loading-modal.ts` 생성

### Step 3: 기존 페이지 적용 (FE)

적용 대상 및 우선순위:

| # | 페이지 | SSE 사용 | 단계 수 | 변경 규모 |
|---|--------|---------|---------|----------|
| 1 | analysis | No (REST) | 7 | M - 전체 실행 버튼 추가 |
| 2 | vectorize | Yes | 6 | S - useSSE + modal 연동 |
| 3 | direction | Yes | 3 | S - useSSE + modal 연동 |
| 4 | strategy | Yes | 3 | S - useSSE + modal 연동 |
| 5 | sections | Yes | N개 | S - 생성 중 modal |
| 6 | pricing | Yes | 1 | S - 단순 로딩 |
| 7 | review | Yes | 1 | S - 단순 로딩 |

### Step 4: 에러 상태 통합 (FE + BE, Task 066 연동)

- Task 066의 `errorCode` 활용
- `AI_KEY_ERROR` 시 "설정에서 확인" 버튼
- 네트워크 에러 시 "다시 시도" 버튼
- 타임아웃 시 "재실행" 버튼

## File Changes

| 파일 | 변경 | 크기 |
|------|------|------|
| `components/ui/loading-modal.tsx` | **신규** - 모달 컴포넌트 | M |
| `components/providers/loading-modal-provider.tsx` | **신규** - Context Provider | M |
| `lib/hooks/use-loading-modal.ts` | **신규** - 훅 | S |
| `app/layout.tsx` | Provider 추가 | S |
| `components/project/analysis-step-runner.tsx` | 전체 실행 + modal 연동 | M |
| `components/project/vector-registration-panel.tsx` | modal 연동 | S |
| `app/projects/[id]/direction/page.tsx` | modal 연동 | S |
| `app/projects/[id]/strategy/page.tsx` | modal 연동 | S |
| `app/projects/[id]/sections/page.tsx` | modal 연동 | S |
| `app/projects/[id]/pricing/page.tsx` | modal 연동 | S |
| `app/projects/[id]/review/page.tsx` | modal 연동 | S |

## UX Scenarios

### Scenario 1: 정상 실행 (RFP 분석)

1. 사용자가 "전체 분석 실행" 클릭
2. LoadingModal 열림 (dim + 7단계 stepper)
3. Step 1~7 순차 실행, stepper 실시간 업데이트
4. 완료 시 모달 자동 닫힘 + 분석 결과 표시

### Scenario 2: API 키 에러

1. 분석 실행 중 Step 3에서 401 에러 발생
2. Step 3 상태가 'error'로 변경 (빨간 X)
3. 에러 메시지: "AI API 키가 설정되지 않았습니다"
4. "설정에서 확인" 버튼 표시 → 클릭 시 /settings 이동
5. "닫기" 버튼으로 모달 닫기

### Scenario 3: 네트워크 에러

1. SSE 스트리밍 중 연결 끊김
2. 모달에 에러 표시
3. "다시 시도" 버튼 → 재실행

### Scenario 4: 벡터 생성 (SSE 6단계)

1. 벡터 페이지에서 "벡터 데이터 생성" 클릭
2. LoadingModal (6단계 stepper + 배치별 progress)
3. 완료 시 자동 닫힘

## Test Cases

1. LoadingModal 렌더링: open=true, steps, progress, error 각 상태
2. dim 배경 클릭 시 모달 닫히지 않음 (잠금 동작)
3. ESC 키 눌러도 닫히지 않음
4. error.action.href 클릭 시 페이지 이동
5. useLoadingModal 훅: open/close/updateProgress 정상 동작
6. useSSE + useLoadingModal 연동: progress 동기화
7. analysis 전체 실행: 7단계 순차 + modal 업데이트
8. 다크 모드 렌더링

## Dependencies

- Task 066 (API Key Error Handling) - errorCode 활용
- shadcn Dialog component (이미 설치됨)
- Lucide icons (CheckCircle, Loader2, Circle, XCircle)

## Design Decisions

1. **Portal 렌더링**: document.body에 Portal로 마운트하여 z-index 충돌 방지
2. **Context 패턴**: 전역 Provider를 통해 어느 컴포넌트에서든 모달 제어 가능
3. **useSSE 변경 없음**: 기존 훅은 그대로 두고, 페이지 레벨에서 useEffect로 동기화
4. **non-SSE 지원**: analysis처럼 REST 호출 기반도 동일한 모달로 처리
5. **선택적 취소**: onCancel이 있을 때만 취소 버튼 표시 (대부분 비표시)
