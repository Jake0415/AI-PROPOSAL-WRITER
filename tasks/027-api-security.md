# Task 027: API 보안 (CSRF, Rate Limit, 입력 검증)

## 상태: ✅ 완료

## Phase: 2.5 - 프로덕션 기반 인프라

## 우선순위: 긴급 (CRITICAL)

## 목표

CSRF 보호, Rate Limiting, 입력 검증 강화를 통해 API 보안을 프로덕션 수준으로 높인다.

## 구현 사항

- [ ] CSRF 보호 (lib/security/csrf.ts)
  - POST/PUT/DELETE에 CSRF 토큰 필수
  - 세션 기반 토큰 발급/검증
- [ ] Rate Limiting (lib/security/rate-limit.ts)
  - 인메모리 기반 (온프레미스)
  - 로그인: 5회/분, 일반 API: 100회/분, AI 생성: 10회/분
  - 429 Too Many Requests 응답
- [ ] 입력 검증 강화
  - 모든 API에 Zod 스키마 적용
  - 파일명 새니타이징 (경로 탐색 방지)
- [ ] Content-Security-Policy 헤더
- [ ] API 요청 크기 제한

## 관련 파일

- `lib/security/csrf.ts` (신규)
- `lib/security/rate-limit.ts` (신규)
- `middleware.ts` (수정)
- `next.config.ts` (수정, CSP)

## 의존성

- Task 024 완료 필요 (세션 기반 CSRF)
- Task 026 완료 필요 (에러 핸들러)

## 테스트 체크리스트

- [ ] CSRF 토큰 없는 POST → 403
- [ ] Rate limit 초과 → 429
- [ ] 악의적 파일명 → 새니타이징 확인
