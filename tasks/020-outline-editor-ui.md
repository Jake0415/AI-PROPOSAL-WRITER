# Task 020: 목차 편집 UI

## 상태: 대기

## Phase: 3 - RFP 업로드 & 분석

## 목표

읽기 전용이었던 목차 UI를 드래그앤드롭 트리 편집기로 전면 리디자인한다. 인라인 편집, 항목 추가/삭제, 메타데이터 패널, 페이지 배분 요약을 구현한다.

## 화면 구성

```text
+------------------------------------------------------+
| 목차 구성                              [다음: 내용 생성] |
+------------------------------------------------------+
| [AI 생성] [템플릿 선택 ▾] [내 템플릿으로 저장]           |
+------------------------+-----------------------------+
|                        |   메타데이터 패널             |
|   OutlineTreeEditor    |   ─────────────────         |
|   (드래그앤드롭 트리)    |   선택 항목: 1.3 기술부문    |
|                        |   예상 페이지: [_8_]         |
|   ▼ 1. 사업이해 및 분석  |   중요도: [높음 ▾]          |
|     1.1 사업 개요       |   매핑 평가항목: [선택 ▾]    |
|     1.2 현황 분석       |   배점: 30점                |
|   ▼ 2. 제안 전략       |                            |
|   ...                  |   ─────────────────         |
|   [+ 항목 추가]        |   페이지 배분 요약           |
|                        |   기술부문: 40p (45%)       |
|                        |   총합: 88p                 |
+------------------------+-----------------------------+
```

## 구현 사항

### 패키지 설치

- [ ] `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` 설치

### shadcn/ui 컴포넌트 추가

- [ ] dialog, tabs, select, alert-dialog, tooltip, progress

### 신규 컴포넌트

- [ ] `OutlineTreeEditor` (components/proposal/outline-tree-editor.tsx)
  - @dnd-kit 기반 드래그앤드롭 트리
  - 플랫 배열 변환 + indentationWidth 기반 레벨 렌더링
  - 항목 선택 상태 관리
- [ ] `OutlineTreeItem` (components/proposal/outline-tree-item.tsx)
  - 드래그 핸들
  - 인라인 제목 편집 (더블클릭 → 입력 → Enter/Blur 저장)
  - 삭제 버튼 (확인 다이얼로그)
  - 하위 항목 추가 버튼
  - 펼침/접힘 토글
- [ ] `OutlineMetaPanel` (components/proposal/outline-meta-panel.tsx)
  - 선택된 항목의 메타데이터 편집
  - 예상 페이지 수 입력 (number input)
  - 중요도 선택 (select: 높음/중간/낮음)
  - 평가항목 매핑 (select, evaluationCriteria에서 로드)
  - 메모 입력 (textarea)
- [ ] `OutlinePageSummary` (components/proposal/outline-page-summary.tsx)
  - 대분류별 페이지 합계
  - 비율 시각화 (progress bar)
  - 총 페이지 수
- [ ] `OutlineToolbar` (components/proposal/outline-toolbar.tsx)
  - "AI 생성" 버튼 (기존 SSE 호출)
  - "템플릿 선택" 버튼 (Task 021에서 구현)
  - "내 템플릿으로 저장" 버튼 (Task 021에서 구현)

### 페이지 리디자인

- [ ] `app/projects/[id]/outline/page.tsx` 전면 리디자인
  - 좌: OutlineTreeEditor, 우: OutlineMetaPanel + OutlinePageSummary
  - 자동 저장 (1초 debounce → PUT 호출)
  - 저장 상태 인디케이터 ("저장 중..." / "저장 완료")

## 관련 파일

- `components/proposal/outline-tree-editor.tsx` (신규)
- `components/proposal/outline-tree-item.tsx` (신규)
- `components/proposal/outline-meta-panel.tsx` (신규)
- `components/proposal/outline-page-summary.tsx` (신규)
- `components/proposal/outline-toolbar.tsx` (신규)
- `app/projects/[id]/outline/page.tsx` (리디자인)

## 의존성

- Task 012 확장 완료 필요

## 테스트 체크리스트

- [ ] 드래그앤드롭으로 항목 순서 변경
- [ ] 인라인 제목 편집 → 저장
- [ ] 항목 추가 → 트리에 표시
- [ ] 항목 삭제 → 확인 후 제거
- [ ] 메타데이터 편집 → 자동 저장
- [ ] 페이지 배분 요약 실시간 업데이트
- [ ] 모바일/태블릿 반응형 확인
