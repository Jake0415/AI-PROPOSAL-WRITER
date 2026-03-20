# Task 023: Supabase PostgreSQL 전환

## 상태: ✅ 완료

## Phase: 2.5 - 프로덕션 기반 인프라

## 우선순위: 긴급 (CRITICAL)

## 목표

SQLite에서 Supabase Cloud PostgreSQL로 DB를 전환한다. Drizzle ORM을 유지하되 드라이버를 postgres-js로 교체하고, 스키마를 pg-core 문법으로 변환한다.

## 구현 사항

### 패키지 변경

- [ ] better-sqlite3, @types/better-sqlite3 제거
- [ ] postgres (postgres-js 드라이버) 설치
- [ ] @supabase/supabase-js 설치 (Storage/Auth용)
- [ ] drizzle-kit 설치 (마이그레이션)

### 스키마 전환 (lib/db/schema.ts)

- [ ] `sqliteTable` → `pgTable` 전환
- [ ] `import { pgTable, text, integer, boolean, timestamp, serial } from 'drizzle-orm/pg-core'`
- [ ] text 날짜 → `timestamp` 타입 변환
- [ ] `integer('...', { mode: 'boolean' })` → `boolean` 네이티브
- [ ] 타입 export 유지 (ProjectStatus, SectionStatus)

### DB 클라이언트 (lib/db/client.ts)

- [ ] `drizzle-orm/postgres-js` + `postgres` 드라이버로 전환
- [ ] `DATABASE_URL` 환경변수 기반 연결
- [ ] `initializeDb()` 제거 (Supabase가 DB 관리, drizzle-kit push로 스키마 적용)
- [ ] Supabase 클라이언트 초기화 (lib/supabase/client.ts 분리)

### Supabase 클라이언트 (lib/supabase/client.ts)

- [ ] 서버 사이드 Supabase 클라이언트 (service_role key)
- [ ] 클라이언트 사이드 Supabase 클라이언트 (anon key)
- [ ] Storage/Auth 접근용

### 마이그레이션

- [ ] drizzle.config.ts 생성 (dialect: 'postgresql')
- [ ] `npx drizzle-kit push` 로 Supabase에 스키마 적용
- [ ] npm script 추가: `db:push`, `db:generate`, `db:studio`

### 설정 파일

- [ ] next.config.ts: serverExternalPackages에서 better-sqlite3 제거
- [ ] .env.example: Supabase 환경변수 추가
- [ ] .gitignore: data/db/ 관련 항목 정리

## 관련 파일

- `lib/db/schema.ts` (전면 수정)
- `lib/db/client.ts` (전면 수정)
- `lib/supabase/client.ts` (신규)
- `package.json` (의존성 교체)
- `drizzle.config.ts` (신규)
- `next.config.ts` (수정)
- `.env.example` (수정)

## 의존성

- Supabase 프로젝트 생성 필요 (supabase.com)

## 테스트 체크리스트

- [ ] Supabase PG 연결 성공
- [ ] drizzle-kit push로 테이블 생성 확인
- [ ] 프로젝트 CRUD API 정상 동작
- [ ] npx tsc --noEmit 통과
- [ ] npm run build 통과
