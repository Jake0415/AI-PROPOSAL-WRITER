# Task 010: 방향성 설정

## 상태: ✅ 완료

## Phase: 3 - RFP 업로드 & 분석

## 목표

AI가 3~5개 제안 방향성 후보를 생성하고, 사용자가 하나를 선택하여 확정하는 기능 완성.

## 구현 사항

- [x] 방향성 생성 API (POST /api/projects/[id]/direction/generate, SSE)
- [x] 방향성 선택 API (PUT /api/projects/[id]/direction/select)
- [x] DirectionSelector UI (카드형 비교/선택)
- [ ] 기존 방향성 로딩 (페이지 재방문 시 API 조회)
- [ ] 방향성 재생성 버튼
- [ ] 프로젝트 상태 자동 업데이트 확인

## 관련 파일

- `app/api/projects/[id]/direction/generate/route.ts`
- `app/api/projects/[id]/direction/select/route.ts`
- `app/projects/[id]/direction/page.tsx`

## 의존성

- Task 009 완료 필요

## 테스트 체크리스트

- [ ] 방향성 3~5개 생성 확인
- [ ] 카드 선택 → 확정 → 다음 단계 이동
- [ ] 페이지 재방문 시 기존 선택 유지
