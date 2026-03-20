# Task 051: RFP 파일 저장 방식 결정

## 상태: ✅ 완료 (파일시스템 방식 채택)

## Phase: 7 - 제안서 관리

## 목표

RFP 파일 저장 방식을 결정하고 안정적으로 구현한다.

## 배경

bytea(PostgreSQL 바이너리) 방식을 시도했으나 postgres.js 드라이버 호환 이슈로 INSERT 실패. 분석 결과 파일시스템 방식이 더 적합:
- DB 크기 최소화 (메타데이터만)
- 다운로드 성능 우수 (파일 스트리밍)
- Docker named volume(upload-data) 이미 존재
- 드라이버 호환 이슈 없음

## 구현 사항

- [x] `lib/db/schema.ts` - rfpFiles.fileData(bytea) → filePath(text)
- [x] `lib/repositories/rfp.repository.ts` - fileData → filePath
- [x] `app/api/projects/[id]/rfp/upload/route.ts` - 파일시스템 저장 (data/uploads/[projectId]/)
- [x] `app/api/projects/[id]/rfp/download/route.ts` - 파일시스템에서 읽기
- [x] `Dockerfile` - pdf-parse, mammoth 패키지 (이전 커밋에서 완료)

## 아키텍처 결정

| 기준 | bytea (기각) | 파일시스템 (채택) |
|------|-------------|-----------------|
| 드라이버 호환 | postgres.js 이슈 | 문제 없음 |
| DB 크기 | 급증 | 최소 |
| 백업 | 느림 | DB+볼륨 분리 |
| 성능 | DB 커넥션 점유 | 스트리밍 |
