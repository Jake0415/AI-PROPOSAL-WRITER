# Task 007: 프로젝트 API

## 상태: ✅ 완료

## Phase: 2 - UI 골격 & 대시보드

## 목표

프로젝트 CRUD REST API와 시스템 헬스체크 API 구현.

## 구현 사항

- [x] GET /api/projects - 프로젝트 목록
- [x] POST /api/projects - 프로젝트 생성 (Zod 검증)
- [x] GET /api/projects/[id] - 프로젝트 상세
- [x] DELETE /api/projects/[id] - 프로젝트 삭제
- [x] GET /api/health - 헬스체크
- [x] DB 자동 초기화 (최초 API 호출 시)

## 관련 파일

- `app/api/projects/route.ts`
- `app/api/projects/[id]/route.ts`
- `app/api/health/route.ts`

## 테스트 체크리스트

- [x] 프로젝트 생성 → 목록에 표시
- [x] 프로젝트 삭제 → 목록에서 제거
- [x] 빌드 통과

## 변경 사항 요약

프로젝트 CRUD API 3개 + 헬스체크 API 구현 완료.
