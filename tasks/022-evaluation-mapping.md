# Task 022: 평가항목-목차 매핑 및 페이지 배분

## 상태: 대기

## Phase: 3 - RFP 업로드 & 분석

## 목표

RFP 평가항목과 제안서 목차를 1:1로 매핑하고, 배점 비중에 비례하여 각 섹션의 페이지 배분을 자동 계산하는 기능. 공공입찰 제안서의 핵심 원칙(목차 = 평가표 순서 대응)을 시스템으로 구현.

## 배경

- 공공 제안서 핵심 원칙: **목차가 RFP 평가항목과 1:1 대응**해야 함
- 평가위원은 평가표 순서대로 채점 → 목차 불일치 시 감점
- 배점이 30점인 항목에 1페이지만 할당하면 내용 부족으로 판단
- 배점 비율에 비례한 페이지 배분이 전략적

## 구현 사항

### 평가항목 로딩

- [ ] 기존 rfpAnalyses.evaluationCriteria JSON에서 평가항목 목록 로드
- [ ] 평가항목을 OutlineMetaPanel의 select 드롭다운에 표시
  - 형식: `[카테고리] 항목명 (배점)` 예: `[기술평가] 시스템 아키텍처 (30점)`

### 매핑 기능

- [ ] 목차 항목 선택 → 메타데이터 패널에서 평가항목 매핑
- [ ] 매핑 시 자동으로 설정:
  - `evaluationItemId`: 평가항목 식별자
  - `evaluationScore`: 해당 배점
  - `importance`: 배점 기준 자동 결정
    - 20점 이상: 'high'
    - 10~19점: 'medium'
    - 10점 미만: 'low'

### 페이지 자동 배분 알고리즘

- [ ] 배점 비례 페이지 배분 로직 구현 (lib/utils/ 또는 별도 유틸)
  - 입력: 총 목표 페이지 수, 각 섹션의 evaluationScore
  - 산출: 각 섹션의 estimatedPages
  - 공식: `섹션 페이지 = 총 페이지 × (섹션 배점 / 총 배점)` (최소 1페이지 보장)
  - 대분류의 배점을 하위 항목에 균등 배분
- [ ] "총 목표 페이지 수" 입력 UI (기본값: 100)
- [ ] "자동 배분" 버튼 → 전체 섹션의 estimatedPages 재계산

### 매핑 상태 표시

- [ ] OutlinePageSummary에 매핑 커버리지 표시
  - `매핑 완료: 8/12 평가항목 (67%)`
  - 미매핑 평가항목 경고 목록
- [ ] 트리 아이템에 매핑 상태 아이콘 (매핑됨: 체크, 미매핑: 경고)

### AI 프롬프트 개선

- [ ] outline-generation.ts: AI가 생성할 때 평가항목 자동 매핑
  - evaluationCriteria를 프롬프트에 전달
  - 각 섹션에 가장 적합한 평가항목을 meta.evaluationItemId로 설정
  - 배점 기반 estimatedPages 계산하여 포함

## 관련 파일

- `components/proposal/outline-meta-panel.tsx` (확장)
- `components/proposal/outline-page-summary.tsx` (확장)
- `components/proposal/outline-tree-item.tsx` (매핑 상태 아이콘)
- `lib/ai/prompts/outline-generation.ts` (매핑 로직 개선)
- `app/projects/[id]/outline/page.tsx` (총 페이지 수 입력, 자동 배분)

## 의존성

- Task 020 완료 필요 (편집 UI)
- Task 021 완료 필요 (템플릿에도 매핑 적용)

## 테스트 체크리스트

- [ ] 평가항목 드롭다운에 RFP 분석 결과 표시
- [ ] 매핑 → evaluationScore, importance 자동 설정
- [ ] 총 페이지 수 입력 → "자동 배분" → 각 섹션 페이지 계산
- [ ] 매핑 커버리지 표시 (X/Y 평가항목)
- [ ] 미매핑 항목 경고 표시
- [ ] AI 생성 시 자동 매핑 결과 포함 확인
