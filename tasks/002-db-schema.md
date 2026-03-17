# Task 002: DB 스키마 및 클라이언트

## 상태: ✅ 완료

## Phase: 1 - 애플리케이션 골격 구축

## 목표

SQLite + Drizzle ORM 기반 데이터 모델을 정의하고, DB 연결 클라이언트 및 초기화 로직을 구현.

## 구현 사항

- [x] Drizzle ORM 스키마 정의 (9개 테이블: projects, rfp_files, rfp_analyses, proposal_directions, proposal_strategies, proposal_outlines, proposal_sections, templates, output_files)
- [x] 타입 export (ProjectStatus, SectionStatus)
- [x] SQLite 클라이언트 (WAL 모드, foreign keys ON)
- [x] DB 초기화 함수 (CREATE TABLE IF NOT EXISTS)
- [x] 싱글턴 패턴 DB 연결

## 관련 파일

- `lib/db/schema.ts`
- `lib/db/client.ts`

## 변경 사항 요약

9개 테이블의 Drizzle 스키마와 SQLite 클라이언트 구현 완료. WAL 모드로 동시성 지원.
