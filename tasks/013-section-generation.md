# Task 013: 섹션 내용 생성

## 상태: ✅ 완료

## Phase: 4 - 내용 생성 & 산출물 출력

## 목표

각 목차 항목별로 AI가 상세 내용을 생성하고, 사용자가 마크다운 편집기로 수정할 수 있는 기능.

## 구현 사항

- [ ] 전체 섹션 내용 생성 API (POST /api/projects/[id]/sections/generate, SSE)
- [ ] 개별 섹션 재생성 API (POST /api/projects/[id]/sections/[sectionId]/generate)
- [ ] 섹션 조회 API (GET /api/projects/[id]/sections)
- [ ] 섹션 수정 API (PUT /api/projects/[id]/sections/[sectionId])
- [ ] SectionEditor UI (마크다운 편집기)
- [ ] 섹션별 생성 진행률 표시
- [ ] 재생성 버튼 (프롬프트 조정)
- [ ] app/projects/[id]/sections/page.tsx 완성 (현재 placeholder)

## 관련 파일

- `app/api/projects/[id]/sections/` (신규)
- `app/projects/[id]/sections/page.tsx` (수정)
- `lib/ai/prompts/section-generation.ts` (기존)

## 의존성

- Task 012 완료 필요

## 테스트 체크리스트

- [ ] 전체 섹션 순차 생성 확인
- [ ] 개별 섹션 재생성 동작
- [ ] 마크다운 편집 → 저장
- [ ] 생성 진행률 실시간 표시
