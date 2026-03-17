# Task 026: 에러 처리 및 구조화 로깅

## 상태: 대기

## Phase: 2.5 - 프로덕션 기반 인프라

## 우선순위: 긴급 (CRITICAL)

## 목표

전역 에러 핸들링 체계와 구조화 로깅을 도입하여 프로덕션 운영에 필요한 가시성을 확보한다.

## 구현 사항

- [ ] AppError 커스텀 에러 클래스 (lib/errors/app-error.ts)
  - ValidationError, AuthenticationError, AuthorizationError, NotFoundError
- [ ] 구조화 로거 (lib/logger/index.ts)
  - pino 기반 JSON 로깅
  - 요청 ID(requestId) 추적
  - 환경별 설정 (dev: pretty, prod: JSON)
- [ ] API 에러 핸들러 유틸리티 (lib/errors/api-handler.ts)
  - withErrorHandler 래퍼 함수
  - 에러 타입별 HTTP 상태 코드
  - 프로덕션에서 내부 에러 상세 숨김
- [ ] 기존 모든 API 라우트에 에러 핸들러 적용
- [ ] 요청 로깅 미들웨어 (method, path, duration, status)
- [ ] app/error.tsx 전역 에러 바운더리
- [ ] app/not-found.tsx 404 페이지

## 관련 파일

- `lib/errors/app-error.ts` (신규)
- `lib/errors/api-handler.ts` (신규)
- `lib/logger/index.ts` (신규)
- `middleware.ts` (수정)
- `app/error.tsx` (신규)
- `app/not-found.tsx` (신규)
- `app/api/**` (기존 API 수정)

## 의존성

- Task 023 완료 필요

## 테스트 체크리스트

- [ ] 잘못된 입력 → 400 + 구조화 로그
- [ ] 존재하지 않는 리소스 → 404
- [ ] 예기치 않은 에러 → 500 + 상세 숨김
- [ ] 로그 파일에 JSON 출력 확인
