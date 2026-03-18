# Task 039: 섹션 편집기 + 요구사항 추적 패널

## 상태: 대기

## Phase: 3 - RFP 분석 & 제안서 생성 파이프라인

## 우선순위: 높음 (P0)

## 목표

섹션 내용 편집 시 해당 섹션이 커버하는 REQ-ID 목록과 전체 요구사항 커버리지를 실시간으로 표시하는 추적 패널을 구현한다.

## 요구사항

- [ ] ReqTrackingPanel 컴포넌트 구현 (components/proposal/req-tracking-panel.tsx)
- [ ] 섹션별 REQ-ID 매핑 조회 API (GET /api/projects/[id]/sections/[sectionId]/tracking)
- [ ] 전체 REQ-ID 커버리지 요약 API (GET /api/projects/[id]/tracking/summary)
- [ ] 섹션 편집기에 추적 패널 통합 (SectionEditor 우측 사이드 패널)
- [ ] REQ-ID 링크 기능 — 섹션에 REQ-ID를 수동으로 연결/해제
- [ ] 커버리지 프로그레스 바 — 전체/카테고리별 커버리지 비율
- [ ] 미커버 요구사항 하이라이트 — 아직 매핑되지 않은 REQ-ID 목록
- [ ] AI 자동 매핑 제안 — 섹션 내용 분석하여 관련 REQ-ID 자동 추천
- [ ] linkedReqIds 필드를 ProposalSection에 추가 (DB 스키마 확장)

## 기술 상세

### 패널 레이아웃

섹션 편집 페이지 (`/projects/[id]/sections`)에서:
- 좌측 (70%): 기존 SectionEditor (마크다운 편집기)
- 우측 (30%): ReqTrackingPanel
  - 상단: 전체 커버리지 도넛 차트 (N/M REQ 커버됨)
  - 중단: 카테고리별 커버리지 바 (7개 카테고리)
  - 하단: 현재 섹션에 연결된 REQ-ID 태그 목록 (추가/제거 가능)
  - 최하단: 미커버 REQ-ID 목록 (클릭 시 상세 보기)

### AI 자동 매핑

섹션 내용이 변경될 때 (debounce 500ms):
1. 섹션 내용을 AI에게 전달
2. 관련 REQ-ID 후보를 추천 받음
3. 사용자가 승인/거부하여 최종 매핑 확정

### DB 확장

`proposal_sections` 테이블에 `linked_req_ids` TEXT[] 컬럼 추가 (PostgreSQL 배열 타입)

## 관련 파일

- `components/proposal/req-tracking-panel.tsx` — 신규
- `app/projects/[id]/sections/page.tsx` — 수정 (패널 통합)
- `app/api/projects/[id]/sections/[sectionId]/tracking/route.ts` — 신규
- `app/api/projects/[id]/tracking/summary/route.ts` — 신규
- `lib/db/schema.ts` — linked_req_ids 컬럼 추가
- `lib/services/section-generator.service.ts` — 매핑 로직 추가
- `components/proposal/section-editor.tsx` — 레이아웃 수정

## 의존성

- Task 009 (RFP 분석 — REQ-ID 추출) 완료 필요
- Task 013 (섹션 내용 생성) 완료 필요

## 테스트

- [ ] REQ-ID 매핑 추가/제거가 DB에 반영되는지 확인
- [ ] 전체 커버리지 비율이 정확히 계산되는지 확인
- [ ] 카테고리별 커버리지가 7개 카테고리 모두 표시되는지 확인
- [ ] 미커버 REQ-ID 목록이 올바르게 필터링되는지 확인
- [ ] AI 자동 매핑 제안이 관련성 높은 REQ-ID를 추천하는지 확인
- [ ] 섹션 전환 시 패널이 해당 섹션 데이터로 갱신되는지 확인
- [ ] npx tsc --noEmit 통과
- [ ] npm run build 통과
