# AIPROWRITER 개발 로드맵

RFP를 업로드하면 AI가 수주 최적화 분석부터 검증 리포트, 가격 제안서까지 자동 생성하는 멀티 LLM 기반 제안서 작성 솔루션

**최종 업데이트**: 2026-03-18
**진행 상황**: 12/41 Tasks 완료 (29%)
**목표**: 다양한 회사에 설치하여 5~20명이 운영하는 프로덕션 제품

## 개요

AIPROWRITER는 공공입찰 제안 PM을 위한 AI 제안서 자동 생성 솔루션으로 다음 기능을 제공합니다:

- **RFP 수주 최적화 분석**: PDF/DOCX 업로드 → 7단계 분석 (EVAL-ID + REQ-ID 7개 카테고리 + 추적성 매트릭스)
- **전략 수립**: 경쟁 분석/SWOT → 방향성 제시 → 경쟁 전략 → 목차 자동 구성
- **문서 생성**: 섹션별 AI 내용 생성 + REQ-ID 추적 → Word/PPT 자동 출력
- **자동 검증**: proposal-reviewer 에이전트 기반 예상 점수 + 충족도 + 개선사항
- **가격 제안**: price-proposal 에이전트 기반 산출내역서 자동 생성
- **운영 관리**: 멀티유저, RBAC, 사용량 추적, Docker 배포

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| 프레임워크 | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + shadcn/ui + TailwindCSS v4 |
| DB | **Supabase** (PostgreSQL) + Drizzle ORM |
| 인증 | **Supabase Auth** + SSO/LDAP 옵션 |
| 파일 저장 | **Supabase Storage** |
| AI (1) | **Claude API** (@anthropic-ai/sdk) |
| AI (2) | **OpenAI GPT API** (openai) |
| 배포 | Docker (앱만, DB는 Supabase Cloud) |
| 테스트 | Vitest + Playwright |

## 개발 단계

### Phase 1: 애플리케이션 골격 구축 ✅

- **Task 001: 프로젝트 초기 설정** ✅ - 완료
  - See: `/tasks/001-project-setup.md`
- **Task 002: DB 스키마 및 클라이언트** ✅ - 완료
  - See: `/tasks/002-db-schema.md`
- **Task 003: AI 클라이언트 및 타입 정의** ✅ - 완료
  - See: `/tasks/003-ai-client.md`
- **Task 004: Repository 패턴 구현** ✅ - 완료
  - See: `/tasks/004-repository-pattern.md`

### Phase 2: UI 골격 & 핵심 인프라 ✅

- **Task 005: 대시보드 UI** ✅ - 완료
  - See: `/tasks/005-dashboard-ui.md`
- **Task 006: 프로젝트 레이아웃** ✅ - 완료
  - See: `/tasks/006-project-layout.md`
- **Task 007: 프로젝트 API** ✅ - 완료
  - See: `/tasks/007-project-api.md`
- **Task 008: RFP 업로드** ✅ - 완료
  - See: `/tasks/008-rfp-upload.md`
- **Task 023: Supabase PostgreSQL 전환** ✅ - 완료
  - See: `/tasks/023-postgresql-migration.md`
  - SQLite → Supabase PostgreSQL, Drizzle ORM 드라이버 교체
- **Task 024: Supabase Auth 인증** ✅ - 완료
  - See: `/tasks/024-auth-system.md`
  - 이메일/PW + 소셜 로그인 + 세션 관리
- **Task 037: 멀티 LLM 지원 (GPT + Claude)** ✅ - 완료
  - GPT/Claude 선택/전환, LLM 라우터, 모델 설정 UI

### Phase 2.5: 프로덕션 기반 인프라 ⬅️ 다음 진행

- **Task 025: RBAC 역할 기반 접근제어**
  - See: `/tasks/025-rbac.md`
  - admin / proposal_pm / tech_writer / viewer 역할
  - 프로젝트 멤버 관리, 권한 매트릭스

- **Task 026: 에러 처리 및 구조화 로깅**
  - See: `/tasks/026-error-logging.md`
  - AppError 클래스, pino 로거, 요청 ID 추적
  - 기존 API에 에러 핸들러 적용

- **Task 027: API 보안**
  - See: `/tasks/027-api-security.md`
  - CSRF 보호, Rate Limiting, CSP 헤더

- **Task 028: 파일 업로드 보안 강화**
  - See: `/tasks/028-file-upload-security.md`
  - MIME 타입 검증, 파일 크기 제한, 파일명 새니타이징

- **Task 029: 테스트 인프라 구축**
  - See: `/tasks/029-test-infrastructure.md`
  - Vitest + Playwright 설정, 기본 테스트 작성

### Phase 3: RFP 분석 & 제안서 생성 파이프라인

- **Task 009: RFP 7단계 수주 최적화 분석** ✅ - 구현됨
  - See: `/tasks/009-rfp-analysis.md`
  - 7단계 분석, EVAL-ID, REQ-ID 7개 카테고리, 추적성 매트릭스
  - 6개 탭 UI (사업개요/요구사항/평가기준/추적성/키워드/원문)

- **Task 010: 방향성 설정**
  - See: `/tasks/010-direction-setting.md`

- **Task 011: 전략 수립**
  - See: `/tasks/011-strategy-planning.md`

- **Task 012: 목차 구성 — API + 타입 + DB 확장**
  - See: `/tasks/012-outline-generation.md`

- **Task 020: 목차 편집 UI**
  - See: `/tasks/020-outline-editor-ui.md`
  - @dnd-kit 드래그앤드롭, 메타데이터 패널

- **Task 021: 레이아웃 템플릿 시스템**
  - See: `/tasks/021-outline-templates.md`
  - 업종별 기본 템플릿 (SI/컨설팅/유지보수)

- **Task 022: 평가항목-목차 매핑**
  - See: `/tasks/022-evaluation-mapping.md`
  - RFP 평가항목 1:1 대응, 배점 비례 페이지 배분

- **Task 013: 섹션 내용 생성**
  - See: `/tasks/013-section-generation.md`

- **Task 038: 제안서 자동 검증 리포트**
  - See: `/tasks/038-proposal-review-report.md`
  - proposal-reviewer 에이전트, 예상 점수, 충족도, 개선사항

- **Task 039: 섹션 편집기 + 요구사항 추적 패널**
  - See: `/tasks/039-requirement-tracking-panel.md`
  - REQ-ID 커버리지 실시간 표시

- **Task 040: 단계별 검증 게이트**
  - See: `/tasks/040-stage-gate-validation.md`
  - 각 단계 완료 시 자동 품질 체크

### Phase 4: 수주 최적화 고도화

- **Task 041: 가격 제안서 생성**
  - See: `/tasks/041-price-proposal.md`
  - price-proposal 에이전트, 산출내역서, 인건비 산정

- **Task 042: 경쟁 분석 + SWOT**
  - See: `/tasks/042-competitive-analysis.md`
  - service-analyst 에이전트, 방향성 선택 근거

- **Task 043: 목차-평가항목 히트맵**
  - See: `/tasks/043-outline-heatmap.md`
  - 매핑 상태 시각화, 미매핑 즉시 식별

- **Task 044: 제안서 버전 관리 + 비교**
  - See: `/tasks/044-version-management.md`
  - 스냅샷 저장, diff 비교, 이전 버전 복원

### Phase 5: 산출물 출력 & 고도화

- **Task 014: Word 문서 렌더링**
  - See: `/tasks/014-word-renderer.md`
- **Task 015: PPT 장표 렌더링**
  - See: `/tasks/015-ppt-renderer.md`
- **Task 016: 산출물 출력 페이지**
  - See: `/tasks/016-output-page.md`
- **Task 017: 사용자 템플릿 관리**
  - See: `/tasks/017-template-upload.md`
- **Task 018: Mermaid 다이어그램**
  - See: `/tasks/018-mermaid-diagrams.md`

### Phase 5.5: 제안서 작성 가이드 ✅

- **Task 019: 제안서 작성 가이드** ✅ - 완료
  - 팁 패널 + 가이드 페이지 (/guide) + AI 코칭

### Phase 6: 운영 및 배포

- **Task 030: 관리자 대시보드**
  - See: `/tasks/030-admin-dashboard.md`
  - 사용자 관리, AI 사용량/비용 추적, 시스템 설정

- **Task 031: 감사 로그 시스템**
  - See: `/tasks/031-audit-logs.md`
  - 사용자 활동 추적, 보안 감사

- **Task 032: Docker 배포**
  - See: `/tasks/032-docker-deployment.md`
  - Dockerfile + docker-compose, 초기 설정 스크립트

- **Task 033: 백업/복구 시스템**
  - See: `/tasks/033-backup-restore.md`
  - 자동 백업, 수동 복구, 보관 정책

- **Task 034: 회사별 커스터마이징**
  - See: `/tasks/034-company-customization.md`
  - 로고, 앱 이름, 색상 테마

- **Task 035: SSO/LDAP 옵션**
  - See: `/tasks/035-sso-ldap.md`
  - LDAP 연동, SAML/OIDC 옵션

- **Task 036: 운영 문서**
  - See: `/tasks/036-operations-docs.md`
  - 설치가이드, 운영매뉴얼, API 문서, 사용자 매뉴얼

## 타임라인 (예상)

| 주차 | 태스크 | 설명 |
| --- | --- | --- |
| 1-2 | 025-026 | RBAC + 에러/로깅 |
| 3 | 027-029 | API 보안 + 파일 보안 + 테스트 |
| 4-5 | 010-011 | 방향성 + 전략 |
| 6-7 | 012, 020-022 | 목차 관련 |
| 8-9 | 013, 039 | 내용 생성 + REQ-ID 추적 패널 |
| 10 | 038, 040 | 검증 리포트 + 검증 게이트 |
| 11-12 | 041-044 | 가격 제안서 + 경쟁 분석 + 히트맵 + 버전 관리 |
| 13-14 | 014-016 | Word/PPT 렌더링 + 출력 페이지 |
| 15 | 017-018 | 템플릿 + 다이어그램 |
| 16-17 | 030-031 | 관리자 + 감사 로그 |
| 18 | 032 | Docker 배포 |
| 19 | 033-034 | 백업 + 커스터마이징 |
| 20 | 035-036 | SSO + 운영 문서 |
