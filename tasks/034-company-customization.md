# Task 034: 회사별 커스터마이징

## 상태: 진행중

## Phase: 6 - 운영 및 배포

## 우선순위: 보통 (MEDIUM)

## 목표

설치 기업별 로고, 앱 이름, 색상 테마를 커스터마이징할 수 있게 한다.

## 구현 사항

- [ ] tenant_settings 테이블 (appName, logoUrl, primaryColor, faviconUrl)
- [ ] 브랜딩 설정 페이지 (app/admin/branding/page.tsx)
  - 로고 업로드 (이미지 검증)
  - 앱 이름 변경
  - 주요 색상 선택 (color picker)
- [ ] 동적 테마 적용 (CSS 변수 서버사이드 주입)
- [ ] 로고/파비콘 동적 로딩
- [ ] 기본 제안서 헤더/푸터 커스터마이징

## 관련 파일

- `lib/db/schema.ts` (tenant_settings)
- `app/admin/branding/page.tsx` (신규)
- `app/layout.tsx` (수정, 동적 테마)
- `components/layout/navbar.tsx` (수정, 동적 로고)

## 의존성

- Task 030 완료 필요

## 테스트 체크리스트

- [ ] 로고 변경 → 전체 페이지 반영
- [ ] 색상 변경 → 테마 즉시 적용
- [ ] 앱 이름 변경 → 타이틀 반영
