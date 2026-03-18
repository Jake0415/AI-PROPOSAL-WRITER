# Task 041: 가격 제안서 생성

## 상태: 대기

## Phase: 4 - 수주 최적화 고도화

## 우선순위: 중간 (P1)

## 목표

price-proposal AI 에이전트를 기반으로 RFP 분석 결과와 제안서 내용을 참고하여 산출내역서(SW 개발비, HW/SW 도입비, 유지보수비), 인건비 산정, 경비 내역을 자동 생성한다.

## 요구사항

- [ ] price-proposal AI 에이전트 구현 (lib/ai/agents/price-proposal.ts)
- [ ] 가격 제안서 생성 API (POST /api/projects/[id]/price/generate) — SSE 스트리밍
- [ ] 가격 제안서 조회 API (GET /api/projects/[id]/price)
- [ ] 가격 제안서 수정 API (PUT /api/projects/[id]/price)
- [ ] 가격 제안서 UI 페이지 (app/projects/[id]/pricing/page.tsx)
- [ ] PriceEditor 컴포넌트 — 산출내역서 테이블 편집
- [ ] 인건비 산정 테이블 — 등급별 단가 × 공수
- [ ] 경비 내역 테이블 — 여비, 재료비, 기타
- [ ] 총 금액 자동 계산 + RFP 예산 범위 대비 표시
- [ ] PriceProposal, PriceBreakdown, CostItem, LaborCostItem 타입 정의
- [ ] price.repository.ts — DB CRUD
- [ ] price.service.ts — 비즈니스 로직
- [ ] price-generation.ts 프롬프트

## 기술 상세

### AI 에이전트 설계

price-proposal 에이전트 입력:
1. RFP 분석 결과 (사업 범위, 요구사항, 제약 조건, 예산 정보)
2. 제안서 목차 및 섹션 내용 (구현 범위 파악)
3. 공공 SW 사업 대가 기준 (한국소프트웨어산업협회 기준)

출력:
- SW 개발비 항목별 내역
- 투입 인력 구성 (등급, 공수, 단가)
- HW/SW 도입 비용
- 유지보수비 (개발비의 일정 비율)
- 경비 항목 (여비, 재료비, 기타)

### DB 스키마

`price_proposals` 테이블: id, project_id, total_amount (NUMERIC), breakdown (JSONB), generated_at (TIMESTAMPTZ)

### UI 구성

- 상단: 총 금액 요약 카드 + RFP 예산 대비 비율 바
- 탭 1: SW 개발비 테이블 (항목, 단위, 수량, 단가, 금액)
- 탭 2: 인건비 산정 (등급, 월단가, M/M, 금액)
- 탭 3: HW/SW 도입비 테이블
- 탭 4: 유지보수비 테이블
- 탭 5: 경비 내역 (여비, 재료비, 기타)
- 모든 셀 직접 편집 가능, 변경 시 합계 자동 재계산

## 관련 파일

- `lib/ai/agents/price-proposal.ts` — 신규
- `lib/ai/prompts/price-generation.ts` — 신규
- `lib/services/price.service.ts` — 신규
- `lib/repositories/price.repository.ts` — 신규
- `lib/validators/price.schema.ts` — 신규
- `app/api/projects/[id]/price/generate/route.ts` — 신규
- `app/api/projects/[id]/price/route.ts` — 신규
- `app/projects/[id]/pricing/page.tsx` — 신규
- `components/proposal/price-editor.tsx` — 신규
- `lib/db/schema.ts` — price_proposals 테이블 추가

## 의존성

- Task 009 (RFP 분석) 완료 필요
- Task 013 (섹션 내용 생성) 완료 필요 (구현 범위 파악)

## 테스트

- [ ] 가격 제안서 생성 API — 정상 응답 및 SSE 스트리밍 확인
- [ ] 총 금액이 하위 항목 합계와 일치하는지 확인
- [ ] 인건비 = 월단가 × M/M 계산이 정확한지 확인
- [ ] 셀 편집 시 합계가 자동 재계산되는지 확인
- [ ] RFP 예산 초과 시 경고 표시되는지 확인
- [ ] 수정된 가격 제안서가 DB에 저장되는지 확인
- [ ] npx tsc --noEmit 통과
- [ ] npm run build 통과
