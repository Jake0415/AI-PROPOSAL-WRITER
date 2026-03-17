# Task 032: Docker 배포 (Next.js 앱만)

## 상태: 대기

## Phase: 6 - 운영 및 배포

## 우선순위: 높음 (HIGH)

## 목표

Next.js 앱만 Docker 이미지로 빌드하여 온프레미스 또는 클라우드에 배포한다. DB와 Storage는 Supabase Cloud를 사용하므로 PostgreSQL 컨테이너는 불필요하다.

## Supabase Cloud 사용으로 간소화된 부분

- ~~PostgreSQL 컨테이너~~ → Supabase Cloud
- ~~DB 볼륨 마운트~~ → 불필요
- ~~DB 백업 스크립트~~ → Supabase 자동 백업
- ~~초기 DB 마이그레이션~~ → drizzle-kit push (배포 전 실행)

## 구현 사항

### Dockerfile

- [ ] Multi-stage build
  - Stage 1: 의존성 설치 (npm ci)
  - Stage 2: Next.js 빌드 (standalone output)
  - Stage 3: 프로덕션 런타임 (node:alpine)
- [ ] next.config.ts: output: 'standalone' 설정
- [ ] .dockerignore

### Docker Compose (선택, 프록시 포함 시)

- [ ] docker-compose.yml
  - app: Next.js (포트 3000)
  - nginx: 리버스 프록시 + SSL (선택)
- [ ] 환경변수 파일 (.env.docker)

### 배포 스크립트

- [ ] scripts/deploy.sh
  - 이미지 빌드
  - drizzle-kit push (스키마 적용)
  - 컨테이너 시작
- [ ] scripts/upgrade.sh (이미지 교체, 무중단)

### 환경변수 문서

- [ ] .env.docker.example
  - DATABASE_URL (Supabase PG 연결 문자열)
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_KEY
  - ANTHROPIC_API_KEY

## 관련 파일

- `Dockerfile` (신규)
- `docker-compose.yml` (신규)
- `.dockerignore` (신규)
- `scripts/deploy.sh` (신규)
- `scripts/upgrade.sh` (신규)
- `next.config.ts` (수정, standalone)
- `.env.docker.example` (신규)

## 의존성

- Task 023 완료 필요

## 테스트 체크리스트

- [ ] docker build 성공
- [ ] docker run → Supabase 연결 + 앱 동작
- [ ] 이미지 크기 300MB 이하 (PG 없으므로 작아짐)
- [ ] 컨테이너 재시작 후 정상 동작
