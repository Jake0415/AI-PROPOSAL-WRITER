# AIPROWRITER 개발 로드맵

RFP를 업로드하면 AI가 수주 최적화 분석부터 검증 리포트, 가격 제안서까지 자동 생성하는 멀티 LLM 기반 제안서 작성 솔루션

**최종 업데이트**: 2026-03-20
**진행 상황**: 38/53 Tasks 완료 (72%)
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
| DB | PostgreSQL 16 + Drizzle ORM (Docker) |
| 인증 | 커스텀 JWT (jose + bcryptjs) |
| 파일 저장 | 로컬 파일 시스템 (data/uploads, data/outputs) |
| AI (1) | **Claude API** (@anthropic-ai/sdk) |
| AI (2) | **OpenAI GPT API** (openai) |
| 배포 | Docker Compose (Nginx + App + PostgreSQL) |
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
  - 10단계 StepNavigation (검증/가격/버전 포함)
- **Task 007: 프로젝트 API** ✅ - 완료
  - See: `/tasks/007-project-api.md`
- **Task 008: RFP 업로드** ✅ - 완료
  - See: `/tasks/008-rfp-upload.md`
- **Task 055: RFP 업로드 UX 개선**
  - See: `/tasks/055-upload-ux-improvement.md`
  - Progress 인라인 통합, 업로드 중 드래그 영역 숨김
- **Task 023: PostgreSQL 전환** ✅ - 완료
  - See: `/tasks/023-postgresql-migration.md`
  - Supabase → PostgreSQL 16 (Docker) + Drizzle ORM 마이그레이션
- **Task 024: 커스텀 JWT 인증** ✅ - 완료
  - See: `/tasks/024-auth-system.md`
  - Supabase Auth → 커스텀 JWT (jose + bcryptjs) 마이그레이션
  - Super Admin 기반 인증 + 세션 관리
- **Task 037: 멀티 LLM 지원 (GPT + Claude)** ✅ - 완료
  - GPT/Claude 선택/전환, LLM 라우터, 모델 설정 UI

### Phase 2.5: 프로덕션 기반 인프라 ✅

- **Task 025: RBAC 역할 기반 접근제어** ✅ - 완료
  - See: `/tasks/025-rbac.md`
  - AppRole 5단계 (super_admin/admin/proposal_pm/tech_writer/viewer)
  - ProjectRole (owner/editor/viewer), 프로젝트 멤버 관리, 권한 매트릭스

- **Task 026: 에러 처리 및 구조화 로깅** ✅ - 완료
  - See: `/tasks/026-error-logging.md`
  - AppError 클래스, JSON 구조화 로거, requestId 추적
  - 기존 API에 에러 핸들러 적용

- **Task 027: API 보안** ✅ - 완료
  - See: `/tasks/027-api-security.md`
  - Rate Limiting (100/min 일반, 10/min AI), CSP 헤더, 보안 헤더 (next.config + nginx)

- **Task 028: 파일 업로드 보안 강화** ✅ - 완료
  - See: `/tasks/028-file-upload-security.md`
  - MIME 타입 검증, magic bytes 검증, 파일명 새니타이징, 50MB 제한
  - `lib/security/sanitize.ts`

- **Task 029: 테스트 인프라 구축** ✅ - 완료
  - See: `/tasks/029-test-infrastructure.md`
  - Vitest + Playwright 설정, 8개 테스트 파일, 43개 테스트 통과

### Phase 3: RFP 분석 & 제안서 생성 파이프라인 ✅

- **Task 009: RFP 7단계 수주 최적화 분석** ✅ - 완료
  - See: `/tasks/009-rfp-analysis.md`
  - 7단계 분석, EVAL-ID, REQ-ID 7개 카테고리, 추적성 매트릭스
  - 6개 탭 UI (사업개요/요구사항/평가기준/추적성/키워드/원문)
  - 서비스 레이어 분리 (`lib/services/analysis.service.ts`)
  - 단계별 실시간 진행 표시 (Streaming + JSON Key Detection, 10단계 스테퍼 UI)

- **Task 010: 방향성 설정** ✅ - 완료
  - See: `/tasks/010-direction-setting.md`
  - 3-5개 후보 생성, 선택 API, 기존 데이터 로드 분기
  - 서비스 레이어 (`lib/services/direction.service.ts`)

- **Task 011: 전략 수립** ✅ - 완료
  - See: `/tasks/011-strategy-planning.md`
  - 경쟁 전략, 차별화 포인트, 핵심 메시지
  - 톤앤매너/문체 설정 (formal/descriptive/concise/persuasive)
  - 서비스 레이어 (`lib/services/strategy.service.ts`)

- **Task 012: 목차 구성** ✅ - 완료
  - See: `/tasks/012-outline-generation.md`
  - 계층적 목차 자동 생성, 조회/수정 API
  - 서비스 레이어 (`lib/services/outline.service.ts`)

- **Task 020: 목차 편집 UI** ✅ - 완료
  - See: `/tasks/020-outline-editor-ui.md`
  - HTML5 네이티브 드래그앤드롭으로 순서 변경
  - 기존 데이터 로드 분기, 재생성 버튼

- **Task 021: 레이아웃 템플릿 시스템**
  - See: `/tasks/021-outline-templates.md`
  - 업종별 기본 템플릿 (SI/컨설팅/유지보수)
  - (일부 구현됨: Template CRUD API 존재, 업종별 기본 템플릿 미구현)

- **Task 022: 평가항목-목차 매핑**
  - See: `/tasks/022-evaluation-mapping.md`
  - RFP 평가항목 1:1 대응, 배점 비례 페이지 배분

- **Task 013: 섹션 내용 생성** ✅ - 완료
  - See: `/tasks/013-section-generation.md`
  - 병렬 생성 (동시 3개, `runWithConcurrency`)
  - 서비스 레이어 (`lib/services/section-generator.service.ts`)
  - Mermaid 다이어그램 렌더링 연동

- **Task 038: 제안서 자동 검증 리포트** ✅ - 완료
  - See: `/tasks/038-proposal-review-report.md`
  - DB + Repository + Prompt + Service + API + UI 전체 파이프라인
  - 평가항목별 점수, 요구사항 충족도, 개선사항 3탭 UI
  - 등급 시스템 (A/B/C/D/F)

- **Task 039: 섹션 편집기 + 요구사항 추적 패널** ✅ - 완료
  - See: `/tasks/039-requirement-tracking-panel.md`
  - `linkedReqIds` DB 컬럼 추가
  - `ReqTrackingPanel` 컴포넌트 (카테고리별 커버리지, 미반영 경고)

- **Task 040: 단계별 검증 게이트** ✅ - 완료
  - See: `/tasks/040-stage-gate-validation.md`
  - Gate 1 (전략→목차), Gate 2 (섹션→검증), Gate 3 (출력 전 최종)
  - `gate.service.ts` + API (`/api/projects/:id/gate/1|2|3`)

### Phase 4: 수주 최적화 고도화 ✅ (3/4 완료)

- **Task 041: 가격 제안서 생성** ✅ - 완료
  - See: `/tasks/041-price-proposal.md`
  - DB + Repository + Prompt + Service + API + UI 전체 파이프라인
  - 직접인건비/직접경비/제경비/간접비/부가세 산출
  - 가격 경쟁력 분석, 4탭 UI

- **Task 042: 경쟁 분석 + SWOT** ✅ - 완료
  - See: `/tasks/042-competitive-analysis.md`
  - SWOT 분석 프롬프트 + API
  - 경쟁사, 차별화 전략, 리스크 분석

- **Task 043: 목차-평가항목 히트맵** ✅ - 완료
  - See: `/tasks/043-outline-heatmap.md`
  - `HeatmapPanel` 컴포넌트 (배점 비례 색상 코딩, 비율 바)

- **Task 044: 제안서 버전 관리 + 비교**
  - See: `/tasks/044-version-management.md`
  - 스냅샷 저장, diff 비교, 이전 버전 복원

### Phase 5: 산출물 출력 & 고도화 ✅ (4/5 완료)

- **Task 014: Word 문서 렌더링** ✅ - 완료
  - See: `/tasks/014-word-renderer.md`
  - `generateWordDocument` (표지/목차/Executive Summary/본문)
- **Task 015: PPT 장표 렌더링** ✅ - 완료
  - See: `/tasks/015-ppt-renderer.md`
  - `generatePptDocument` (16:9 와이드, 슬라이드별 렌더링)
- **Task 016: 산출물 출력 페이지** ✅ - 완료
  - See: `/tasks/016-output-page.md`
  - Word/PPT 다운로드, 로컬 파일 저장
- **Task 017: 사용자 템플릿 관리**
  - See: `/tasks/017-template-upload.md`
  - docxtemplater 연동, 사용자 템플릿 업로드/적용
- **Task 018: Mermaid 다이어그램** ✅ - 완료
  - See: `/tasks/018-mermaid-diagrams.md`
  - `MermaidDiagram` 컴포넌트, 섹션 편집기 연동

### Phase 5.5: 제안서 작성 가이드 ✅

- **Task 019: 제안서 작성 가이드** ✅ - 완료
  - 팁 패널 + 가이드 페이지 (/guide) + AI 코칭

### Phase 6: 운영 및 배포

- **Task 030: 관리자 대시보드** ✅ - 완료
  - See: `/tasks/030-admin-dashboard.md`
  - 사용자 관리, 프로젝트 통계, 역할 할당
  - `app/admin/page.tsx` + `app/admin/users/page.tsx`

- **Task 031: 감사 로그 시스템**
  - See: `/tasks/031-audit-logs.md`
  - 사용자 활동 추적, 보안 감사

- **Task 032: Docker 배포** ✅ - 완료
  - See: `/tasks/032-docker-deployment.md`
  - Dockerfile (멀티스테이지) + docker-compose (Nginx + App + PostgreSQL)
  - healthcheck, named volumes, 메모리/CPU 제한 설정

- **Task 033: 백업/복구 시스템**
  - See: `/tasks/033-backup-restore.md`
  - 자동 백업, 수동 복구, 보관 정책

- **Task 034: 회사별 커스터마이징**
  - See: `/tasks/034-company-customization.md`
  - 로고, 앱 이름, 색상 테마

- **Task 036: 운영 문서**
  - See: `/tasks/036-operations-docs.md`
  - 설치가이드, 운영매뉴얼, API 문서, 사용자 매뉴얼

- **Task 045: 프롬프트 관리 시스템**
  - See: `/tasks/045-prompt-management.md`
  - 9개 LLM 프롬프트를 기능/내용/용도로 정의
  - DB 기반 CRUD + 버전 관리 + 테스트 실행
  - 관리자 UI (프롬프트 목록/편집/버전이력/테스트)

### Phase 7: 제안서 관리

- **Task 046: 프로젝트 목록 API 확장** ✅ - 완료
  - See: `/tasks/046-project-list-api.md`
  - 멤버/RFP 요약 정보 JOIN, 필터/검색/페이지네이션

- **Task 047: 대시보드 UI 개선** ✅ - 완료
  - See: `/tasks/047-dashboard-enhancement.md`
  - 필터/검색, 카드/테이블 뷰 전환, RFP 요약/담당자 아바타/진행률 표시

- **Task 048: 담당자 관리** ✅ - 완료
  - See: `/tasks/048-member-management.md`
  - 프로젝트별 담당자 배정/역할변경/제거 Dialog, proposal_pm 이상 권한

- **Task 051: RFP 파일 DB 저장**
  - See: `/tasks/051-rfp-file-db-storage.md`
  - 파일시스템 → PostgreSQL bytea 저장, 다운로드 API, Dockerfile 패키지 수정

### Phase 8: 대화형 AI 파이프라인

- **Task 052: 대화 DB 스키마 확장**
  - See: `/tasks/052-conversation-db.md`
  - conversations, messages, llm_call_logs 테이블
  - Repository + 시드 데이터

- **Task 053: 대화형 AI 서비스 + API**
  - See: `/tasks/053-conversation-service.md`
  - conversation.service + ai-pipeline 오케스트레이터
  - 대화 API 5개 + LLM 로그 API
  - AI 클라이언트 토큰 추적 확장

- **Task 054: AI 채팅 패널 UI**
  - See: `/tasks/054-ai-chat-panel.md`
  - 우측 슬라이드 패널, 각 단계 페이지에 채팅 버튼
  - SSE 스트리밍 + 마크다운 렌더링
  - 관리자 LLM 사용량 대시보드

## 아키텍처 개선 사항 (Sprint 1-5 완료)

- **서비스 레이어 패턴**: API route에서 비즈니스 로직 분리 → 8개 서비스 파일
- **SSE 유틸리티**: `createSSEResponse()` 래퍼로 스트리밍 보일러플레이트 제거
- **프로젝트 상태 자동 전이**: 각 서비스 완료 시 다음 상태로 자동 업데이트
- **섹션 병렬 생성**: 순차 처리 → 동시 3개 병렬 실행
- **SSEProgress 공통 타입**: 모든 서비스에서 통일된 진행률 타입 사용
- **RFP 분석 스트리밍 단계 표시**: `generateStream` 기반 JSON Key Detection으로 실시간 10단계 진행률 (`AnalysisProgressStepper` 컴포넌트)

## 남은 태스크 구현 순서 (14개, 프론트엔드 선행)

### Phase 1: 빠른 UI 구현

| 순서 | #   | 제목           | 규모 | 설명                                   |
| ---- | --- | -------------- | ---- | -------------------------------------- |
| 1    | 034 | 회사별 커스터마이징 | S | 로고/앱명/테마 설정 UI + 동적 로딩      |
| 2    | 022 | 평가항목-목차 매핑  | M | 매핑 메타패널 + 배점 비례 페이지 배분   |
| 3    | 021 | 업종별 템플릿      | M | 템플릿 선택 모달 + 3개 시드 데이터      |

### Phase 2: 템플릿 + 감사

| 순서 | #   | 제목           | 규모 | 설명                                   |
| ---- | --- | -------------- | ---- | -------------------------------------- |
| 4    | 017 | 사용자 템플릿 관리 | M | docxtemplater 연동 + 업로드/적용 UI    |
| 5    | 031 | 감사 로그         | M | audit_logs 테이블 + 관리자 뷰어        |

### Phase 3: 프롬프트 관리 + 대형 기능

| 순서 | #   | 제목           | 규모 | 설명                                   |
| ---- | --- | -------------- | ---- | -------------------------------------- |
| 6    | 045 | 프롬프트 관리 시스템 | L | DB 기반 프롬프트 CRUD + 버전 관리 + 관리자 UI |
| 7    | 044 | 버전 관리 + 비교  | L | 스냅샷/복원 + 타임라인 UI + diff 뷰어  |
| 8    | 033 | 백업/복구         | S | JSON 내보내기/가져오기 + pg_dump        |

### Phase 4: 문서화 (병렬 가능)

| 순서 | #   | 제목           | 규모 | 설명                                   |
| ---- | --- | -------------- | ---- | -------------------------------------- |
| 9    | 036 | 운영 문서         | S | 설치/운영/API/사용자 매뉴얼             |

### Phase 5: 대화형 AI 파이프라인

| 순서 | #   | 제목                  | 규모 | 설명                                          |
| ---- | --- | --------------------- | ---- | --------------------------------------------- |
| 13   | 052 | 대화 DB 스키마 확장   | M    | conversations, messages, llm_call_logs 테이블  |
| 14   | 053 | 대화형 AI 서비스 + API | L   | 대화 서비스 + 파이프라인 + API 6개             |
| 15   | 054 | AI 채팅 패널 UI       | L    | 우측 슬라이드 패널 + 각 단계 채팅 버튼         |

### Phase 6: 제안서 관리 (우선 구현)

| 순서 | #   | 제목           | 규모 | 설명                                   |
| ---- | --- | -------------- | ---- | -------------------------------------- |
| 10   | 046 | 프로젝트 목록 API 확장 | S | 멤버/RFP JOIN, 필터/검색/페이지네이션   |
| 11   | 047 | 대시보드 UI 개선    | M | 필터/검색, 카드/테이블 뷰, RFP 요약, 진행률 |
| 12   | 048 | 담당자 관리         | M | 배정/변경/제거 Dialog, 권한 기반 접근제어 |
