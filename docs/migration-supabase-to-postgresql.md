# Supabase → PostgreSQL + 커스텀 인증 마이그레이션 계획

## Context

현재 프로젝트는 **Supabase를 인증(Auth)에만** 사용하고, DB 접근은 이미 Drizzle ORM + 직접 PostgreSQL 연결입니다.
Docker Compose에 PostgreSQL을 포함하여 완전 자체 호스팅 구조로 전환합니다.

**변경 범위**: Supabase Auth → JWT + bcrypt 커스텀 인증, Docker Compose에 PostgreSQL 추가

---

## Step 1: 패키지 변경

**설치**: `bcryptjs`, `jose` + `@types/bcryptjs`
**제거**: `@supabase/ssr`, `@supabase/supabase-js`

> `jose`는 Edge Runtime 호환 JWT 라이브러리 — 미들웨어 + API 라우트 모두에서 사용

---

## Step 2: DB 스키마 수정

**파일**: [lib/db/schema.ts](lib/db/schema.ts)

`profiles` 테이블에 `passwordHash` 필드 추가:
```ts
export const profiles = aiprowriterSchema.table('profiles', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(), // ← 추가
  name: text('name').notNull().default(''),
  role: text('role').$type<AppRole>().notNull().default('viewer'),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
```

---

## Step 3: 인증 유틸리티 생성

### 3-1. JWT 유틸리티 (새 파일)
**파일**: [lib/auth/jwt.ts](lib/auth/jwt.ts)

- `signToken(payload)` — JWT 생성 (HS256, `JWT_SECRET` 환경변수)
- `verifyToken(token)` — JWT 검증, payload 반환
- 토큰 만료: 7일 (`JWT_EXPIRES_IN` 환경변수)

### 3-2. 비밀번호 유틸리티 (새 파일)
**파일**: [lib/auth/password.ts](lib/auth/password.ts)

- `hashPassword(plain)` — bcryptjs로 해싱 (12 rounds)
- `comparePassword(plain, hash)` — 비밀번호 검증

### 3-3. 세션 헬퍼 (새 파일)
**파일**: [lib/auth/session.ts](lib/auth/session.ts)

- `setSessionCookie(response, token)` — HttpOnly 쿠키에 JWT 저장 (`auth-token`)
- `getSessionFromCookies(cookies)` — 쿠키에서 JWT 추출 & 검증 → user payload 반환
- `clearSessionCookie(response)` — 쿠키 제거

---

## Step 4: 인증 API 라우트 수정

### 4-1. 로그인 API (새 파일)
**파일**: [app/api/auth/login/route.ts](app/api/auth/login/route.ts)

```
POST /api/auth/login { email, password }
→ DB에서 프로필 조회 (email)
→ bcrypt.compare(password, passwordHash)
→ JWT 생성 → Set-Cookie: auth-token
→ { success: true, data: { id, email, name, role } }
```

### 4-2. 회원가입 API (새 파일)
**파일**: [app/api/auth/register/route.ts](app/api/auth/register/route.ts)

```
POST /api/auth/register { email, password, name }
→ 이메일 중복 확인
→ bcrypt.hash(password)
→ DB에 프로필 INSERT (id = uuid)
→ JWT 생성 → Set-Cookie: auth-token
→ { success: true, data: { id, email, name, role } }
```

### 4-3. 로그아웃 API (새 파일)
**파일**: [app/api/auth/logout/route.ts](app/api/auth/logout/route.ts)

```
POST /api/auth/logout
→ Set-Cookie: auth-token=''; Max-Age=0
→ { success: true }
```

### 4-4. 현재 사용자 API (새 파일)
**파일**: [app/api/auth/me/route.ts](app/api/auth/me/route.ts)

```
GET /api/auth/me
→ 쿠키에서 JWT 검증
→ DB에서 프로필 조회
→ { success: true, data: profile }
```

### 4-5. 프로필 API 수정
**파일**: [app/api/auth/profile/route.ts](app/api/auth/profile/route.ts)

Supabase 참조 제거 → JWT 쿠키에서 사용자 ID 추출

---

## Step 5: with-auth.ts 수정

**파일**: [lib/auth/with-auth.ts](lib/auth/with-auth.ts)

변경: `createSupabaseServerClient()` → `getSessionFromCookies(cookies())`로 교체
```ts
export async function requireAuth() {
  const cookieStore = await cookies();
  const session = getSessionFromCookies(cookieStore);
  if (!session) return NextResponse.json(...401);
  const profile = await profileRepository.findByUserId(session.userId);
  return { id: session.userId, email: session.email, role: profile?.role ?? 'viewer' };
}
```

---

## Step 6: 미들웨어 수정

**파일**: [middleware.ts](middleware.ts)

변경: `updateSession()` → 직접 쿠키에서 `auth-token` 읽어 JWT 검증
- `jsonwebtoken`은 Edge Runtime에서 사용 불가 → `jose` 라이브러리 사용 또는 Web Crypto API로 검증
- 대안: 미들웨어에서는 쿠키 존재 여부만 확인, 실제 검증은 API 라우트에서 수행

**권장 접근**: 미들웨어에서 `jose` 라이브러리로 JWT 검증 (Edge 호환)
→ `jose` 패키지 추가 설치 필요

---

## Step 7: 프론트엔드 수정

### 7-1. 로그인 페이지
**파일**: [app/auth/login/page.tsx](app/auth/login/page.tsx)

변경: Supabase 클라이언트 → `fetch('/api/auth/login', { method: 'POST', body })` 호출

### 7-2. 회원가입 페이지
**파일**: [app/auth/register/page.tsx](app/auth/register/page.tsx)

변경: Supabase 클라이언트 → `fetch('/api/auth/register', { method: 'POST', body })` 호출

### 7-3. use-auth 훅
**파일**: [lib/hooks/use-auth.ts](lib/hooks/use-auth.ts)

변경: Supabase 클라이언트 → `fetch('/api/auth/me')` 호출, `signOut` → `fetch('/api/auth/logout')`
`onAuthStateChange` 제거 (불필요)

### 7-4. Navbar
**파일**: [components/layout/navbar.tsx](components/layout/navbar.tsx)

변경: Supabase 클라이언트 → `fetch('/api/auth/me')` 호출, logout → `fetch('/api/auth/logout')`

---

## Step 8: Supabase 파일 삭제

삭제할 파일:
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/middleware.ts`
- `app/auth/callback/route.ts` (OAuth 콜백, 불필요)

---

## Step 9: Docker Compose에 PostgreSQL 추가

**파일**: [docker-compose.yml](docker-compose.yml)

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: aiprowriter
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-aiprowriter}
      POSTGRES_DB: aiprowriter
    volumes:
      - pg-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U aiprowriter"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  app:
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://aiprowriter:${POSTGRES_PASSWORD:-aiprowriter}@db:5432/aiprowriter
    # ... 기존 설정 유지

  migrate:
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://aiprowriter:${POSTGRES_PASSWORD:-aiprowriter}@db:5432/aiprowriter
```

---

## Step 10: 환경변수 정리

**파일**: [.env.example](.env.example)

제거:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

추가:
- `JWT_SECRET` (필수, 랜덤 문자열 32자 이상)
- `POSTGRES_PASSWORD` (Docker PostgreSQL 비밀번호)

`DATABASE_URL` 형식 변경:
- 기존: `postgresql://postgres.[ref]:[pw]@...pooler.supabase.com:6543/postgres`
- 변경: `postgresql://aiprowriter:password@db:5432/aiprowriter` (Docker 내부) 또는 `localhost:5432` (로컬)

---

## Step 11: next.config.ts CSP 헤더 수정

**파일**: [next.config.ts](next.config.ts)

CSP `connect-src`에서 `https://*.supabase.co` 제거

---

## Step 12: Dockerfile 수정

- Supabase 관련 Build ARG 제거 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_DESCRIPTION`만 유지

---

## 수정 파일 요약

| 구분 | 파일 | 변경 |
|------|------|------|
| 삭제 | `lib/supabase/client.ts` | Supabase 브라우저 클라이언트 |
| 삭제 | `lib/supabase/server.ts` | Supabase 서버 클라이언트 |
| 삭제 | `lib/supabase/middleware.ts` | Supabase 세션 관리 |
| 삭제 | `app/auth/callback/route.ts` | OAuth 콜백 (불필요) |
| 생성 | `lib/auth/jwt.ts` | JWT 서명/검증 |
| 생성 | `lib/auth/password.ts` | bcrypt 해싱 |
| 생성 | `lib/auth/session.ts` | 쿠키 세션 관리 |
| 생성 | `app/api/auth/login/route.ts` | 로그인 API |
| 생성 | `app/api/auth/register/route.ts` | 회원가입 API |
| 생성 | `app/api/auth/logout/route.ts` | 로그아웃 API |
| 생성 | `app/api/auth/me/route.ts` | 현재 사용자 API |
| 수정 | `lib/db/schema.ts` | profiles에 passwordHash 추가 |
| 수정 | `lib/auth/with-auth.ts` | Supabase → JWT 세션 |
| 수정 | `middleware.ts` | Supabase → 쿠키 JWT 검증 |
| 수정 | `app/auth/login/page.tsx` | Supabase → fetch API |
| 수정 | `app/auth/register/page.tsx` | Supabase → fetch API |
| 수정 | `app/api/auth/profile/route.ts` | Supabase → JWT 세션 |
| 수정 | `lib/hooks/use-auth.ts` | Supabase → fetch API |
| 수정 | `components/layout/navbar.tsx` | Supabase → fetch API |
| 수정 | `lib/db/client.ts` | prepare:false 주석 업데이트 |
| 수정 | `docker-compose.yml` | PostgreSQL 서비스 추가 |
| 수정 | `Dockerfile` | Supabase ARG 제거 |
| 수정 | `.env.example` | Supabase 변수 제거, JWT_SECRET 추가 |
| 수정 | `next.config.ts` | CSP에서 supabase.co 제거 |
| 수정 | `package.json` | 의존성 교체 |

---

## 검증 방법

1. `docker compose --env-file .env.local build` — 빌드 성공
2. `docker compose --env-file .env.local up -d` — PostgreSQL + App 기동
3. `docker compose --env-file .env.local --profile migration run migrate` — 스키마 생성
4. `http://localhost:3100/auth/register` — 회원가입 테스트
5. `http://localhost:3100/auth/login` — 로그인 테스트
6. `http://localhost:3100/api/auth/me` — 세션 확인
7. 보호된 페이지 접근 → 로그인 리다이렉트 확인
