# Task 030: 관리자 대시보드

## 상태: ✅ 완료

## Phase: 6 - 운영 및 배포

## 우선순위: 높음 (HIGH)

## 목표

관리자 전용 대시보드를 구현하여 사용자 관리, AI 사용량/비용 추적, 시스템 설정을 통합 관리한다. 기존 Task 019(관리자 설정)를 흡수/확장한다.

## 구현 사항

### 관리자 레이아웃

- [ ] app/admin/layout.tsx (admin 역할만 접근)
- [ ] 관리자 전용 사이드바 네비게이션

### 사용자 관리

- [ ] 사용자 목록/검색/필터 페이지
- [ ] 사용자 초대 기능 (이메일 기반)
- [ ] 역할 변경, 비활성화
- [ ] 사용자 관리 API

### AI 사용량 대시보드

- [ ] ai_usage_logs 테이블 (userId, projectId, model, inputTokens, outputTokens, cost, createdAt)
- [ ] 일별/월별 사용량 차트
- [ ] 사용자별/프로젝트별 집계
- [ ] 비용 경고 임계값 설정

### 시스템 설정

- [ ] AI API 키 관리 (암호화 저장)
- [ ] 기본 AI 모델 선택
- [ ] 파일 크기 제한 설정
- [ ] 세션 만료 시간 설정

### 시스템 헬스

- [ ] DB 연결 상태, 디스크 용량, 메모리 표시

## 관련 파일

- `app/admin/layout.tsx` (신규)
- `app/admin/page.tsx` (신규)
- `app/admin/users/page.tsx` (신규)
- `app/admin/settings/page.tsx` (신규)
- `app/admin/usage/page.tsx` (신규)
- `lib/db/schema.ts` (ai_usage_logs 추가)
- `lib/repositories/usage.repository.ts` (신규)
- `app/api/admin/` (신규)

## 의존성

- Task 024-025 완료 필요 (인증 + RBAC)

## 테스트 체크리스트

- [ ] admin 역할만 /admin 접근 가능
- [ ] 사용자 CRUD 동작
- [ ] AI 사용량 집계 정확성
- [ ] 설정 변경 → 시스템 반영
