# Task 033: 백업/복구 (PostgreSQL Docker)

## 상태: 진행중

## Phase: 6 - 운영 및 배포

## 우선순위: 보통 (MEDIUM)

## 목표

PostgreSQL Docker 볼륨 기반 백업/복구 기능을 제공한다. pg_dump를 활용한 자동/수동 백업과 관리자 UI를 통한 데이터 내보내기/가져오기를 지원한다.

## PostgreSQL 백업

- Docker 볼륨(`pg-data`)에 데이터 저장
- `pg_dump`/`pg_restore`로 백업/복구
- cron 또는 스케줄러로 일일 자동 백업 (선택)

## 구현 사항

### 데이터 내보내기/가져오기

- [ ] 프로젝트 데이터 JSON 내보내기 API
  - POST /api/admin/export — 프로젝트 + 분석 + 목차 + 섹션을 JSON으로
  - 관리자 전용
- [ ] 프로젝트 데이터 가져오기 API
  - POST /api/admin/import — JSON에서 복구
- [ ] 내보내기/가져오기 UI (app/admin/data/page.tsx)

### 파일 백업

- [ ] data/uploads, data/outputs 디렉토리 파일 백업
- [ ] 필요 시 파일 목록 + 다운로드 URL 내보내기

### 백업 스크립트

- [ ] `scripts/backup.sh` — pg_dump + 파일 디렉토리 tar 압축
- [ ] `scripts/restore.sh` — pg_restore + 파일 복원
- [ ] 관리자 대시보드에 마지막 백업 시간 표시

## 관련 파일

- `app/api/admin/export/route.ts` (신규)
- `app/api/admin/import/route.ts` (신규)
- `app/admin/data/page.tsx` (신규)
- `scripts/backup.sh` (신규)
- `scripts/restore.sh` (신규)

## 의존성

- Task 030 완료 필요 (관리자 대시보드)

## 테스트 체크리스트

- [ ] 프로젝트 데이터 내보내기 → JSON 다운로드
- [ ] JSON 가져오기 → 데이터 복구 확인
- [ ] backup.sh 실행 → pg_dump 파일 생성 확인
- [ ] restore.sh 실행 → 데이터 복구 확인
