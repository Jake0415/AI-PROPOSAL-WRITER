# Task 038: 제안서 자동 검증 리포트

## 상태: ✅ 완료

## Phase: 3 - RFP 분석 & 제안서 생성 파이프라인

## 우선순위: 높음 (P0)

## 목표

proposal-reviewer 에이전트를 기반으로 완성된 제안서를 평가위원 관점에서 자동 검증하여 예상 점수, 평가항목별 충족도, 구체적 개선사항을 포함한 리포트를 생성한다.

## 요구사항

- [ ] proposal-reviewer AI 에이전트 구현 (lib/ai/agents/proposal-reviewer.ts)
- [ ] 검증 리포트 생성 API (POST /api/projects/[id]/review/generate) — SSE 스트리밍
- [ ] 검증 리포트 조회 API (GET /api/projects/[id]/review)
- [ ] 검증 리포트 UI 페이지 (app/projects/[id]/review/page.tsx)
- [ ] ReviewDashboard 컴포넌트 — 예상 점수 게이지, 충족도 차트
- [ ] 평가항목별 점수 테이블 (EVAL-ID 기준)
- [ ] 개선사항 목록 — 우선순위별 정렬 (critical/high/medium/low)
- [ ] 약점 섹션 하이라이트 — 클릭 시 해당 섹션으로 이동
- [ ] ReviewReport, EvalItemResult, ReviewImprovement 타입 정의
- [ ] review.repository.ts — DB CRUD
- [ ] review.service.ts — 비즈니스 로직
- [ ] review-generation.ts 프롬프트 — 평가위원 시뮬레이션

## 기술 상세

### AI 에이전트 설계

proposal-reviewer 에이전트는 다음 입력을 받아 검증을 수행한다:
1. RFP 분석 결과 (evaluationCriteria + requirements + traceabilityMatrix)
2. 제안서 전체 섹션 내용
3. 목차-평가항목 매핑 정보

프롬프트는 평가위원의 채점 관점을 시뮬레이션하여:
- 각 EVAL-ID별 예상 점수 산출 (배점 대비 충족도)
- 요구사항 미반영 또는 부족 항목 식별
- 섹션별 구체적 개선 제안 생성

### DB 스키마

`review_reports` 테이블: id, project_id, overall_score, max_possible_score, evaluation_results (JSONB), strengths (JSONB), weaknesses (JSONB), improvements (JSONB), reviewed_at

### UI 구성

- 상단: 전체 점수 게이지 (원형 차트) + 등급 표시
- 중단: 평가항목별 점수 테이블 (EVAL-ID, 항목명, 예상점수/배점, 충족도 바)
- 하단: 개선사항 카드 목록 (우선순위 색상 구분, 대상 섹션 링크)

## 관련 파일

- `lib/ai/agents/proposal-reviewer.ts` — 신규
- `lib/ai/prompts/review-generation.ts` — 신규
- `lib/services/review.service.ts` — 신규
- `lib/repositories/review.repository.ts` — 신규
- `lib/validators/review.schema.ts` — 신규
- `app/api/projects/[id]/review/generate/route.ts` — 신규
- `app/api/projects/[id]/review/route.ts` — 신규
- `app/projects/[id]/review/page.tsx` — 신규
- `components/proposal/review-dashboard.tsx` — 신규
- `lib/db/schema.ts` — review_reports 테이블 추가

## 의존성

- Task 009 (RFP 분석) 완료 필요
- Task 013 (섹션 내용 생성) 완료 필요

## 테스트

- [ ] 검증 리포트 생성 API — 정상 응답 및 SSE 스트리밍 확인
- [ ] 모든 EVAL-ID에 대한 점수가 산출되는지 확인
- [ ] 충족도가 0~100% 범위인지 검증
- [ ] 개선사항이 우선순위별로 정렬되는지 확인
- [ ] 약점 섹션 클릭 시 해당 섹션 편집 페이지로 이동하는지 확인
- [ ] npx tsc --noEmit 통과
- [ ] npm run build 통과
