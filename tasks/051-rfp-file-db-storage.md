# Task 051: RFP 파일 DB 저장

## 상태: 대기

## Phase: 7 - 제안서 관리

## 목표

RFP 파일을 파일시스템 대신 PostgreSQL bytea 컬럼에 직접 저장하여 Docker 환경 호환성 확보. 파일 다운로드 API 추가. Dockerfile에서 누락된 pdf-parse, mammoth 패키지 추가.

## 배경

Docker 환경에서 파일 업로드 시 에러 발생:
1. Dockerfile에서 pdf-parse, mammoth 패키지 누락 → 텍스트 추출 실패
2. 파일시스템 저장 → Docker 볼륨 권한 문제

## 구현 사항

- [ ] `lib/db/schema.ts` 수정 - rfpFiles 테이블 `filePath` → `fileData` (bytea)
- [ ] 마이그레이션 생성/적용
- [ ] `lib/repositories/rfp.repository.ts` 수정 - fileData(Buffer) 저장
- [ ] `app/api/projects/[id]/rfp/upload/route.ts` 수정 - fs 제거, DB 바이너리 저장
- [ ] `app/api/projects/[id]/rfp/download/route.ts` 신규 - 파일 다운로드 API
- [ ] `Dockerfile` 수정 - pdf-parse, mammoth 패키지 추가
- [ ] `lib/services/rfp-parser.service.ts` 수정 - import 확인

## 관련 파일

- `lib/db/schema.ts`
- `lib/repositories/rfp.repository.ts`
- `app/api/projects/[id]/rfp/upload/route.ts`
- `app/api/projects/[id]/rfp/download/route.ts` (신규)
- `Dockerfile`
- `lib/services/rfp-parser.service.ts`

## 검증

- Docker 재빌드 후 실제 PDF/DOCX 파일 업로드 성공
- 업로드된 파일 다운로드 API 동작 확인
- Playwright E2E 테스트 통과
