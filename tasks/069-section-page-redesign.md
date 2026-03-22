# Task 069: 내용 생성 페이지 재설계

## 상태: 진행중

## Phase: 10 - UX 고도화

## 목표

내용 생성 페이지를 대분류 탭 + 챕터별 단계적 생성 + Pretty Print/마크다운/JSON 3탭 편집 + RAG 연동 + 우측 작성 팁 패널로 재설계.

## 구현 사항

### BE
- [x] loadSectionContext 공통 함수
- [x] generateSingleSectionCore (RAG 연동)
- [x] generateChapterSections 함수
- [x] upsertSection Repository
- [x] POST /sections/generate-chapter API (SSE)
- [x] PUT /sections/:id 확장 (title, diagrams)

### FE
- [x] chapter-tab-bar.tsx (대분류 탭 + Badge)
- [x] section-content-viewer.tsx (Pretty Print / 마크다운 / JSON 3탭)
- [x] sections/page.tsx 전면 재작성
- [x] StepTipsPanel 연동 (작성 팁 우측 패널)

## 수정 파일

| 파일 | 변경 |
| ---- | ---- |
| lib/services/section-generator.service.ts | 리팩터링 + RAG 연동 |
| lib/repositories/proposal.repository.ts | upsertSection 추가 |
| app/api/projects/[id]/sections/generate-chapter/route.ts | 신규 SSE API |
| app/api/projects/[id]/sections/[sectionId]/route.ts | PUT 확장 |
| components/project/chapter-tab-bar.tsx | 신규 |
| components/project/section-content-viewer.tsx | 신규 |
| app/projects/[id]/sections/page.tsx | 전면 재작성 |
| lib/guide/tips-data.ts | sections 작성 팁 추가 |
