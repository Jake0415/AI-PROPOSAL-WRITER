# Task 031: 감사 로그 시스템

## 상태: 진행중

## Phase: 6 - 운영 및 배포

## 우선순위: 높음 (HIGH)

## 목표

사용자 활동을 추적하는 감사 로그를 구현하여 보안 감사 및 컴플라이언스 기반을 마련한다.

## 구현 사항

- [ ] audit_logs 테이블 (id, userId, action, resourceType, resourceId, details, ipAddress, userAgent, createdAt)
- [ ] 감사 로그 서비스 (lib/services/audit.service.ts)
  - 자동 로깅: 로그인/로그아웃, 프로젝트 CRUD, 파일 업로드, AI 생성, 산출물 다운로드
- [ ] API 미들웨어에 감사 로깅 통합
- [ ] 감사 로그 조회 API (GET /api/admin/audit-logs, 필터/페이지네이션)
- [ ] 감사 로그 뷰어 UI (app/admin/audit/page.tsx)

## 관련 파일

- `lib/db/schema.ts` (audit_logs 테이블)
- `lib/services/audit.service.ts` (신규)
- `lib/repositories/audit.repository.ts` (신규)
- `app/api/admin/audit-logs/route.ts` (신규)
- `app/admin/audit/page.tsx` (신규)

## 의존성

- Task 024, 026 완료 필요

## 테스트 체크리스트

- [ ] 로그인 시 감사 로그 생성
- [ ] 프로젝트 생성/삭제 시 로그 생성
- [ ] 로그 조회 필터/페이지네이션 동작
