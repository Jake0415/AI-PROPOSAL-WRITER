# Task 040: 단계별 검증 게이트

## 상태: 대기

## Phase: 3 - RFP 분석 & 제안서 생성 파이프라인

## 우선순위: 높음 (P0)

## 목표

핵심 워크플로우의 3개 지점(전략 확정 후, 내용 생성 후, 산출물 출력 전)에 자동 품질 체크 게이트를 두어 품질 기준 미달 시 경고하고 개선을 유도한다.

## 요구사항

- [ ] 검증 게이트 실행 API (POST /api/projects/[id]/gate/[stageNum]/check)
- [ ] 검증 게이트 결과 조회 API (GET /api/projects/[id]/gate/[stageNum])
- [ ] gate.service.ts — 3개 게이트별 체크 로직
- [ ] GateIndicator 컴포넌트 (components/project/gate-indicator.tsx)
- [ ] StepNavigation에 게이트 통과/실패 아이콘 표시
- [ ] 게이트 실패 시 경고 다이얼로그 + 개선 안내
- [ ] 게이트 통과 시 다음 단계로 자동 전환
- [ ] StageGate, GateCheckItem 타입 정의
- [ ] stage_gates DB 테이블 추가

### 게이트 1: 전략 확정 후 (4단계 → 5단계)

- [ ] RFP 평가기준과 전략의 정합성 확인
- [ ] 차별화 포인트가 최소 3개 이상인지 확인
- [ ] 핵심 메시지가 정의되었는지 확인

### 게이트 2: 내용 생성 후 (6단계 → 7단계)

- [ ] 전체 REQ-ID 커버리지 90% 이상 확인
- [ ] 미생성 섹션이 없는지 확인
- [ ] 각 섹션이 최소 글자 수 이상인지 확인

### 게이트 3: 산출물 출력 전 (8단계 → 9단계)

- [ ] 검증 리포트 예상 점수가 기준 이상인지 확인
- [ ] 가격 제안서가 RFP 예산 범위 내인지 확인
- [ ] critical 우선순위 개선사항이 0건인지 확인

## 기술 상세

### 게이트 실행 흐름

1. 사용자가 단계 전환 버튼 클릭
2. 프론트엔드가 gate check API 호출
3. gate.service.ts가 해당 게이트의 모든 checkItems 실행
4. 결과를 DB에 저장하고 프론트엔드에 반환
5. 모든 항목 pass → 다음 단계 전환
6. fail 항목 존재 → 경고 다이얼로그 표시 (강제 진행 옵션 제공)

### DB 스키마

`stage_gates` 테이블: id, project_id, stage (INTEGER), check_items (JSONB), passed (BOOLEAN), checked_at (TIMESTAMPTZ)

### UI 표현

- StepNavigation 각 단계 사이에 게이트 아이콘 (체크/경고/미실행)
- 게이트 실패 시: 빨간색 경고 다이얼로그 + 실패 항목 목록 + "강제 진행" 버튼
- 게이트 통과 시: 녹색 성공 토스트 + 자동 페이지 전환

## 관련 파일

- `lib/services/gate.service.ts` — 신규
- `app/api/projects/[id]/gate/[stageNum]/check/route.ts` — 신규
- `app/api/projects/[id]/gate/[stageNum]/route.ts` — 신규
- `components/project/gate-indicator.tsx` — 신규
- `components/project/step-navigation.tsx` — 수정 (게이트 아이콘 추가)
- `lib/db/schema.ts` — stage_gates 테이블 추가
- `lib/validators/gate.schema.ts` — 신규

## 의존성

- Task 011 (전략 수립) — 게이트 1
- Task 039 (REQ-ID 추적) — 게이트 2
- Task 038 (검증 리포트) — 게이트 3
- Task 041 (가격 제안서) — 게이트 3

## 테스트

- [ ] 게이트 1: 전략 미확정 시 fail 반환 확인
- [ ] 게이트 2: REQ-ID 커버리지 90% 미만 시 fail 반환 확인
- [ ] 게이트 3: critical 개선사항 존재 시 fail 반환 확인
- [ ] 게이트 통과 시 passed=true로 DB에 저장되는지 확인
- [ ] 게이트 실패 시 경고 다이얼로그가 표시되는지 확인
- [ ] 강제 진행 버튼 클릭 시 다음 단계로 이동하는지 확인
- [ ] StepNavigation에 게이트 상태 아이콘이 표시되는지 확인
- [ ] npx tsc --noEmit 통과
- [ ] npm run build 통과
