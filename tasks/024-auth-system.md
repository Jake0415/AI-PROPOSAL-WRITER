# Task 024: 인증 시스템 (Supabase Auth)

## 상태: ✅ 완료

## Phase: 2.5 - 프로덕션 기반 인프라

## 우선순위: 긴급 (CRITICAL)

## 목표

커스텀 JWT 인증으로 이메일/비밀번호 인증을 구현한다. Next.js 미들웨어로 모든 페이지/API를 보호한다.

## Supabase Auth 활용 장점

- 비밀번호 해싱, 세션 관리, 토큰 갱신 자동 처리
- Row Level Security(RLS)와 연동 가능
- 이메일 인증, 비밀번호 재설정 내장

## 구현 사항

### Supabase Auth 설정

- [ ] Supabase 대시보드에서 Email Auth 활성화
- [ ] @supabase/ssr 설치 (Next.js SSR 지원)
- [ ] 서버 사이드 Supabase 클라이언트 (lib/supabase/server.ts)
- [ ] 클라이언트 사이드 Supabase 클라이언트 (lib/supabase/browser.ts)

### 사용자 프로필 확장

- [ ] profiles 테이블 (id→auth.users.id FK, name, role, isActive, createdAt)
- [ ] Supabase trigger: auth.users INSERT → profiles 자동 생성
- [ ] profile.repository.ts

### 인증 API/페이지

- [ ] 로그인 페이지 (app/auth/login/page.tsx)
- [ ] 회원가입 페이지 (app/auth/register/page.tsx) — 초대 기반
- [ ] 비밀번호 재설정 (Supabase 내장 기능 활용)
- [ ] 로그아웃 Server Action

### 미들웨어

- [ ] middleware.ts: Supabase 세션 검증
  - 보호 경로: /, /projects/**, /admin/**
  - 공개 경로: /auth/**, /api/health
  - 세션 갱신 (refresh token)

### UI 통합

- [ ] useAuth Hook (현재 사용자 정보, 로그아웃)
- [ ] navbar에 사용자 이름 + 역할 표시
- [ ] AuthProvider 컴포넌트 (components/providers/)

## 관련 파일

- `lib/supabase/server.ts` (신규)
- `lib/supabase/browser.ts` (신규)
- `lib/db/schema.ts` (profiles 테이블 추가)
- `lib/repositories/profile.repository.ts` (신규)
- `app/auth/login/page.tsx` (신규)
- `app/auth/register/page.tsx` (신규)
- `middleware.ts` (신규)
- `components/providers/auth-provider.tsx` (신규)
- `components/layout/navbar.tsx` (수정)

## 의존성

- Task 023 완료 필요 (Supabase 클라이언트)

## 테스트 체크리스트

- [ ] 이메일/비밀번호 로그인 성공
- [ ] 인증 없이 보호 경로 → 로그인 리다이렉트
- [ ] 세션 만료 → 자동 갱신 또는 로그아웃
- [ ] 로그아웃 → 세션 삭제 + 리다이렉트
- [ ] navbar에 사용자 정보 표시
