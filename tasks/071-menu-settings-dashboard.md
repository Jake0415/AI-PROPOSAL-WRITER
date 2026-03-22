# Task 071: 상단 메뉴 재구성 + 설정 카드 대시보드

## 상태: 진행중

## Phase: 10 - UX 고도화

## 목표

상단 메뉴를 5개로 정리하고, 설정 페이지를 카드 메뉴 대시보드로 재설계하여 admin 기능을 통합.

## 상단 메뉴 변경

| 순서 | 현재 | 변경 후 | 라우트 |
| ---- | ---- | ------- | ------ |
| 1 | 대시보드 | 제안서 작성 | `/` |
| 2 | (admin 개별) | 프롬프트 관리 (admin) | `/admin/prompts` |
| 3 | 템플릿 | 템플릿 관리 | `/templates` |
| 4 | 가이드 | 사용 가이드 | `/guide` |
| 5 | 설정 | 설정 (카드 허브) | `/settings` |

## 설정 카드 대시보드

| 카드 | 아이콘 | 설명 | 이동 경로 | 권한 |
| ---- | ------ | ---- | --------- | ---- |
| 운용현황(관리) | BarChart3 | 프로젝트 현황 및 통계 | /admin | admin |
| AI LLM 설정 | Bot | AI 프로바이더, 모델, API 키 | /settings/ai | all |
| 사용자관리 | Users | 사용자 계정 및 역할 | /admin/users | admin |
| 브랜딩 | Palette | 앱 이름, 로고, 테마 색상 | /admin/customization | admin |
| 데이터 관리 | Database | 데이터 백업 및 복구 | /admin/data | admin |
| 감사로그 | FileSearch | 시스템 활동 추적 | /admin/audit | admin |
| 버전 정보 | Info | 앱 버전 및 시스템 정보 | /settings/version | all |

## 구현 사항

### navbar.tsx
- [ ] 메뉴 라벨 변경 (대시보드→제안서 작성 등)
- [ ] admin 6개 개별 링크 제거
- [ ] 프롬프트 관리 링크 추가 (admin only)

### 설정 페이지
- [ ] 기존 AI 설정 → /settings/ai/page.tsx로 이동
- [ ] /settings/page.tsx → 카드 대시보드 재작성
- [ ] admin 전용 카드 권한 체크

### 버전 정보
- [ ] /settings/version/page.tsx 신규

## 수정 파일

| 파일 | 변경 |
| ---- | ---- |
| components/layout/navbar.tsx | 메뉴 라벨 + 구조 변경 |
| app/settings/page.tsx | 전체 재작성 → 카드 대시보드 |
| app/settings/ai/page.tsx | 신규 (기존 AI 설정 이동) |
| app/settings/version/page.tsx | 신규 |
