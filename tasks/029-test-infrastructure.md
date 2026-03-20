# Task 029: 테스트 인프라 구축

## 상태: ✅ 완료

## Phase: 2.5 - 프로덕션 기반 인프라

## 우선순위: 높음 (HIGH)

## 목표

Vitest + Playwright 테스트 환경을 구축하고 기본 테스트를 작성한다.

## 구현 사항

- [ ] Vitest 설치 및 vitest.config.ts 설정
- [ ] @testing-library/react 설치
- [ ] Playwright 설치 및 playwright.config.ts 설정
- [ ] 테스트 유틸리티 (lib/__tests__/helpers/)
  - DB 시딩 헬퍼
  - 인증 토큰 생성 헬퍼
  - API 요청 헬퍼
- [ ] 유닛 테스트
  - project.repository.test.ts
  - user.repository.test.ts
  - validators/*.test.ts
- [ ] 통합 테스트
  - projects API CRUD
  - auth API login/logout
- [ ] npm scripts (test, test:unit, test:integration, test:e2e, test:coverage)

## 관련 파일

- `vitest.config.ts` (신규)
- `playwright.config.ts` (신규)
- `package.json` (scripts + devDeps)
- `lib/__tests__/helpers/` (신규)
- `lib/repositories/__tests__/` (신규)

## 의존성

- Task 023-024 완료 필요

## 테스트 체크리스트

- [ ] npm run test:unit 성공
- [ ] npm run test:integration 성공
- [ ] 커버리지 리포트 생성
