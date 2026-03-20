# Task 036: 운영 문서

## 상태: 진행중

## Phase: 6 - 운영 및 배포

## 우선순위: 보통 (MEDIUM)

## 목표

고객사 IT 담당자가 독립적으로 설치, 운영, 문제해결을 할 수 있는 문서를 작성한다.

## 구현 사항

- [ ] 설치 가이드 (docs/installation.md)
  - 시스템 요구사항 (Docker, 최소 사양)
  - 설치 절차 (docker-compose)
  - 초기 설정 (관리자 생성, API 키)
  - SSL/TLS 설정 (리버스 프록시)
- [ ] 운영 매뉴얼 (docs/operations.md)
  - 백업/복구 절차
  - 업그레이드 절차
  - 모니터링 가이드
  - 문제해결 FAQ
- [ ] API 문서 (docs/api.md)
- [ ] 사용자 매뉴얼 (docs/user-guide.md)
  - 전체 워크플로우 (스크린샷 포함)

## 관련 파일

- `docs/installation.md` (신규)
- `docs/operations.md` (신규)
- `docs/api.md` (신규)
- `docs/user-guide.md` (신규)

## 의존성

- Phase 4 기능 완료 필요
- Task 032 완료 필요

## 테스트 체크리스트

- [ ] 설치 가이드대로 클린 환경에서 설치 성공
- [ ] 운영 매뉴얼 절차 검증
