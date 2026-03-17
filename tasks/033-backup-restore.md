# Task 033: 백업/복구 (Supabase 활용)

## 상태: 대기

## Phase: 6 - 운영 및 배포

## 우선순위: 보통 (MEDIUM)

## 목표

Supabase Cloud의 자동 백업 기능을 활용하고, 추가적으로 관리자가 수동 백업/복구를 할 수 있는 기능을 제공한다.

## Supabase 자동 백업

- Pro 플랜: 일일 자동 백업 (7일 보관)
- Point-in-Time Recovery 지원
- Supabase 대시보드에서 복구 가능

## 추가 구현 사항

### 데이터 내보내기/가져오기

- [ ] 프로젝트 데이터 JSON 내보내기 API
  - POST /api/admin/export — 프로젝트 + 분석 + 목차 + 섹션을 JSON으로
  - 관리자 전용
- [ ] 프로젝트 데이터 가져오기 API
  - POST /api/admin/import — JSON에서 복구
- [ ] 내보내기/가져오기 UI (app/admin/data/page.tsx)

### Storage 파일 백업

- [ ] Supabase Storage의 파일은 자동 백업됨
- [ ] 필요 시 파일 목록 + 다운로드 URL 내보내기

### 백업 상태 확인

- [ ] 관리자 대시보드에 마지막 백업 시간 표시
- [ ] Supabase Management API로 백업 상태 조회 (선택)

## 관련 파일

- `app/api/admin/export/route.ts` (신규)
- `app/api/admin/import/route.ts` (신규)
- `app/admin/data/page.tsx` (신규)

## 의존성

- Task 030 완료 필요 (관리자 대시보드)

## 테스트 체크리스트

- [ ] 프로젝트 데이터 내보내기 → JSON 다운로드
- [ ] JSON 가져오기 → 데이터 복구 확인
- [ ] Supabase 자동 백업 동작 확인 (대시보드)
