# Task 070: 목차 구성 페이지 재설계

## 상태: 완료

## Phase: 10 - UX 고도화

## 목표

목차 구성 페이지를 트리 에디터 + 페이지 배분 시스템으로 재설계. level 불일치/번호 하드코딩/편집 불가 문제 해결.

## 구현 사항

### BE
- [x] outline.service.ts — level 0-indexed 통일 + evalId/estimatedPages 연결
- [x] outline-generation.ts — 프롬프트 번호 제거 지시, level 변경
- [x] GET API — 기존 데이터 자동 보정 (migrateSections)
- [x] PUT API — totalPages 저장
- [x] proposal.repository — updateOutline에 totalPages 파라미터
- [x] DB schema — total_pages 컬럼 추가

### FE
- [x] outline-numbering.ts — 번호 동적 계산 유틸
- [x] outline-helpers.ts — add/remove/update/reorder/autoAllocate 순수 함수
- [x] OutlineTreeNode — 재귀 노드 (인라인 편집, 드래그, 페이지수, 매핑)
- [x] OutlineTreeEditor — 트리 에디터 컨테이너
- [x] OutlineTotalPagesBar — 총 페이지 설정 + 배점 기반 자동 배분
- [x] OutlineSourceTabs — AI/템플릿 탭 전환 + 교체 경고
- [x] OutlineEvalSummary — 매핑 커버리지 요약
- [x] outline/page.tsx — 전체 재작성 (4상태 화면)

## 수정 파일

| 파일 | 변경 |
| ---- | ---- |
| lib/services/outline.service.ts | level 통일, eval/pages 연결 |
| lib/ai/prompts/outline-generation.ts | 번호 제거, level 변경 |
| app/api/projects/[id]/outline/route.ts | totalPages, level 보정 |
| lib/db/schema.ts | total_pages 컬럼 |
| lib/repositories/proposal.repository.ts | updateOutline totalPages |
| app/projects/[id]/outline/page.tsx | 전체 재작성 |
| components/project/outline-tree-editor.tsx | 신규 |
| components/project/outline-tree-node.tsx | 신규 |
| components/project/outline-total-pages-bar.tsx | 신규 |
| components/project/outline-source-tabs.tsx | 신규 |
| components/project/outline-eval-summary.tsx | 신규 |
| lib/utils/outline-numbering.ts | 신규 |
| lib/utils/outline-helpers.ts | 신규 |
