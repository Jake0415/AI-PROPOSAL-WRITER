# Task 042: 경쟁 분석 + SWOT

## 상태: ✅ 완료

## Phase: 4 - 수주 최적화 고도화

## 우선순위: 중간 (P1)

## 목표

service-analyst AI 에이전트를 기반으로 RFP 사업 영역의 경쟁 환경을 분석하고 SWOT 매트릭스를 생성하여 방향성 선택의 근거를 제공한다.

## 요구사항

- [ ] service-analyst AI 에이전트 구현 (lib/ai/agents/service-analyst.ts)
- [ ] 경쟁 분석 생성 API (POST /api/projects/[id]/competitive/generate) — SSE 스트리밍
- [ ] 경쟁 분석 조회 API (GET /api/projects/[id]/competitive)
- [ ] CompetitivePanel 컴포넌트 (components/proposal/competitive-panel.tsx)
- [ ] SWOT 매트릭스 시각화 (2×2 그리드)
- [ ] 경쟁사 프로필 카드 (강점/약점/시장점유율)
- [ ] 방향성 설정 페이지에 경쟁 분석 패널 통합
- [ ] CompetitiveAnalysis, CompetitorProfile 타입 정의
- [ ] 방향성 후보별 SWOT 기반 추천 점수 표시

## 기술 상세

### AI 에이전트 설계

service-analyst 에이전트 입력:
1. RFP 분석 결과 (사업 개요, 범위, 키워드)
2. 사업 영역/도메인 정보
3. (선택) 사용자 입력 경쟁사 정보

출력:
- SWOT 매트릭스 (강점/약점/기회/위협 각 3~5개)
- 주요 경쟁사 프로필 (2~4개)
- 추천 전략 방향 및 근거
- 방향성 후보별 SWOT 관점 적합도

### UI 구성

방향성 설정 페이지 (`/projects/[id]/direction`) 하단에 통합:
- 좌측: SWOT 매트릭스 (4사분면, 색상 구분)
  - 강점(녹색), 약점(빨간색), 기회(파란색), 위협(주황색)
- 우측: 경쟁사 프로필 카드 목록
  - 각 카드: 회사명, 강점 태그, 약점 태그, 시장점유율 바
- 상단: "경쟁 분석 실행" 버튼 + 진행률 표시
- 방향성 후보 카드에 SWOT 기반 추천 배지 추가

## 관련 파일

- `lib/ai/agents/service-analyst.ts` — 신규
- `lib/ai/prompts/competitive-analysis.ts` — 신규
- `components/proposal/competitive-panel.tsx` — 신규
- `app/api/projects/[id]/competitive/generate/route.ts` — 신규
- `app/api/projects/[id]/competitive/route.ts` — 신규
- `app/projects/[id]/direction/page.tsx` — 수정 (패널 통합)
- `lib/db/schema.ts` — competitive_analyses 테이블 또는 ProposalDirection에 JSONB 필드 추가

## 의존성

- Task 009 (RFP 분석) 완료 필요
- Task 010 (방향성 설정) 완료 필요

## 테스트

- [ ] 경쟁 분석 생성 API — 정상 응답 및 SSE 스트리밍 확인
- [ ] SWOT 4개 카테고리 모두 최소 1개 항목이 생성되는지 확인
- [ ] 경쟁사 프로필이 2개 이상 생성되는지 확인
- [ ] 방향성 후보별 추천 점수가 표시되는지 확인
- [ ] SWOT 매트릭스가 4사분면으로 올바르게 렌더링되는지 확인
- [ ] 경쟁사 프로필 카드가 정상 표시되는지 확인
- [ ] npx tsc --noEmit 통과
- [ ] npm run build 통과
