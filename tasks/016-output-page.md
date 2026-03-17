# Task 016: 산출물 출력 페이지

## 상태: 대기

## Phase: 4 - 내용 생성 & 산출물 출력

## 목표

산출물 출력 페이지를 완성하여 Word/PPT 생성 및 다운로드 기능 제공.

## 구현 사항

- [ ] 출력 페이지 완성 (현재 placeholder → 실제 기능)
- [ ] Word 생성 버튼 + 진행률 표시
- [ ] PPT 생성 버튼 + 진행률 표시
- [ ] 생성된 산출물 목록 표시
- [ ] 다운로드 링크
- [ ] 산출물 목록 API (GET /api/projects/[id]/outputs)

## 관련 파일

- `app/projects/[id]/output/page.tsx` (수정)
- `app/api/projects/[id]/outputs/route.ts` (신규)

## 의존성

- Task 014, 015 완료 필요

## 테스트 체크리스트

- [ ] Word 생성 → 다운로드 성공
- [ ] PPT 생성 → 다운로드 성공
- [ ] 산출물 목록 정상 표시
