# Task 035: SSO/LDAP 옵션 (Supabase Auth 확장)

## 상태: 대기

## Phase: 6 - 운영 및 배포

## 우선순위: 보통 (MEDIUM)

## 목표

Supabase Auth의 내장 SSO 지원을 활용하여 SAML 2.0 / OIDC 프로바이더를 연동한다. LDAP은 Supabase Edge Function을 통해 커스텀 구현한다.

## Supabase Auth SSO 장점

- SAML 2.0 지원 내장 (Pro 플랜)
- Google, Azure AD, Okta 등 주요 IdP 연동
- Supabase 대시보드에서 설정 가능

## 구현 사항

### SAML/OIDC (Supabase 내장)

- [ ] Supabase 대시보드에서 SSO 프로바이더 추가
- [ ] 로그인 페이지에 SSO 로그인 버튼 추가
- [ ] IdP 메타데이터 설정 가이드 문서

### LDAP (커스텀)

- [ ] LDAP 인증 API (POST /api/auth/ldap-login)
  - ldapjs로 LDAP 서버에 인증
  - 성공 시 Supabase Auth에 사용자 자동 생성/로그인
- [ ] LDAP 설정 UI (관리자 설정)
  - host, port, baseDN, bindDN 설정
  - 연결 테스트 기능

### 관리자 설정

- [ ] 인증 방식 선택 (이메일 / SSO / LDAP)
- [ ] 활성화된 인증 방식에 따라 로그인 UI 동적 변경

## 관련 파일

- `app/auth/login/page.tsx` (수정, SSO 버튼)
- `app/api/auth/ldap-login/route.ts` (신규)
- `lib/auth/ldap.ts` (신규)
- `app/admin/settings/auth/page.tsx` (신규)

## 의존성

- Task 024 완료 필요

## 테스트 체크리스트

- [ ] SSO 프로바이더로 로그인 성공
- [ ] LDAP 연결 테스트 성공/실패
- [ ] LDAP 인증 → Supabase 사용자 자동 생성
