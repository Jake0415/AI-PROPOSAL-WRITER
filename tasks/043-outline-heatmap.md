# Task 043: 목차-평가항목 히트맵

## 상태: 대기

## Phase: 4 - 수주 최적화 고도화

## 우선순위: 중간 (P1)

## 목표

목차 편집 화면에서 각 목차 항목과 RFP 평가항목(EVAL-ID) 간의 매핑 상태를 히트맵으로 시각화하여 미매핑 항목을 즉시 식별하고 커버리지를 최적화할 수 있도록 한다.

## 요구사항

- [ ] HeatmapPanel 컴포넌트 구현 (components/proposal/heatmap-panel.tsx)
- [ ] 히트맵 데이터 조회 API (GET /api/projects/[id]/outline/heatmap)
- [ ] 목차-평가항목 매핑 수정 API (PUT /api/projects/[id]/outline/heatmap)
- [ ] 목차 편집 페이지에 히트맵 패널 통합
- [ ] 히트맵 매트릭스 — 행(목차 항목) × 열(EVAL-ID), 색상으로 커버리지 표시
- [ ] 미매핑 항목 경고 — 어떤 목차에도 연결되지 않은 EVAL-ID 빨간색 표시
- [ ] 과매핑 항목 표시 — 너무 많은 목차에 연결된 EVAL-ID 노란색 표시
- [ ] 클릭으로 매핑 추가/제거 — 히트맵 셀 클릭 시 매핑 토글
- [ ] 커버리지 요약 바 — 전체 EVAL-ID 대비 매핑된 비율
- [ ] OutlineHeatmapEntry 타입 정의

## 기술 상세

### 히트맵 레이아웃

목차 편집 페이지 (`/projects/[id]/outline`):
- 상단: 기존 OutlineTree (목차 트리 편집기)
- 하단: HeatmapPanel (히트맵 매트릭스)

### 히트맵 매트릭스 구현

- 행: 목차 섹션 (sectionPath + title)
- 열: EVAL-ID (평가항목)
- 셀 색상:
  - 진한 초록: 완전 매핑 (해당 섹션이 EVAL-ID의 주요 커버 섹션)
  - 연한 초록: 부분 매핑 (보조 커버)
  - 회색: 미매핑
  - 빨간색 헤더: EVAL-ID가 어떤 목차에도 미매핑
- 셀 클릭: 매핑 토글 (미매핑 → 매핑, 매핑 → 미매핑)
- 행/열 호버: 관련 행/열 하이라이트

### 데이터 흐름

1. 목차가 변경되면 히트맵 자동 갱신
2. 히트맵에서 매핑 변경 시 outline의 heatmapData 업데이트
3. 커버리지 요약 바 실시간 갱신

## 관련 파일

- `components/proposal/heatmap-panel.tsx` — 신규
- `app/api/projects/[id]/outline/heatmap/route.ts` — 신규
- `app/projects/[id]/outline/page.tsx` — 수정 (히트맵 패널 통합)
- `lib/db/schema.ts` — outline에 heatmap_data JSONB 필드 추가
- `lib/services/outline.service.ts` — 히트맵 데이터 계산 로직 추가

## 의존성

- Task 009 (RFP 분석 — EVAL-ID 추출) 완료 필요
- Task 012 (목차 구성) 완료 필요
- Task 022 (평가항목-목차 매핑) 완료 필요

## 테스트

- [ ] 히트맵 매트릭스가 행(목차) × 열(EVAL-ID)로 올바르게 렌더링되는지 확인
- [ ] 미매핑 EVAL-ID가 빨간색으로 표시되는지 확인
- [ ] 셀 클릭 시 매핑이 토글되는지 확인
- [ ] 목차 항목 추가/삭제 시 히트맵이 자동 갱신되는지 확인
- [ ] 커버리지 요약 바가 정확한 비율을 표시하는지 확인
- [ ] 매핑 변경이 DB에 저장되는지 확인
- [ ] npx tsc --noEmit 통과
- [ ] npm run build 통과
