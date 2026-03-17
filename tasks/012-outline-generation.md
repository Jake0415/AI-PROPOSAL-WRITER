# Task 012: 목차 구성 — API + 타입 + DB 확장

## 상태: 대기

## Phase: 3 - RFP 업로드 & 분석

## 우선순위: 높음

## 목표

목차(Outline) 시스템의 기반을 확장한다. OutlineSection 타입에 메타데이터를 추가하고, 목차 조회/수정 API를 구현하며, DB 스키마를 확장하여 레이아웃 템플릿과 평가항목 매핑을 위한 토대를 마련한다.

## 구현 사항

### 기존 (완료)

- [x] 목차 생성 API (POST /api/projects/[id]/outline/generate, SSE)
- [x] OutlineTree UI (중첩 목차 표시 — 읽기 전용)

### 타입 확장

- [ ] `OutlineSectionMeta` 인터페이스 추가 (lib/ai/types.ts)
  - `estimatedPages`: 예상 페이지 수
  - `importance`: 'high' | 'medium' | 'low'
  - `evaluationItemId?`: 매핑된 RFP 평가항목 ID
  - `evaluationScore?`: 매핑된 배점
  - `notes?`: 사용자 메모
- [ ] `OutlineSection.meta?` 필드 추가 (optional, 하위호환)

### DB 스키마 확장

- [ ] `outlineTemplates` 테이블 신규 생성 (lib/db/schema.ts)
  - id, name, category(si/consulting/maintenance/custom), description, sections(JSON), isDefault, isUserTemplate, createdAt, updatedAt
- [ ] `proposalOutlines` 테이블에 `templateId`, `updatedAt` 컬럼 추가
- [ ] DB 초기화 SQL에 CREATE TABLE 추가 (lib/db/client.ts)

### API 구현

- [ ] GET /api/projects/[id]/outline — 목차 조회 (기존 목차 로딩)
- [ ] PUT /api/projects/[id]/outline — 목차 수정 (전체 교체)
- [ ] Zod 검증 스키마 (lib/validators/outline.schema.ts 신규)
  - `outlineSectionSchema` (재귀적 z.lazy)
  - `outlineSectionMetaSchema`
  - `updateOutlineSchema`
  - `createOutlineTemplateSchema`

### 프롬프트 개선

- [ ] outline-generation.ts 수정: 출력 JSON에 `meta` 필드 포함
- [ ] evaluationCriteria 배점을 `evaluationScore`에 자동 매핑
- [ ] 배점 비중에 비례한 `estimatedPages` 계산 지시

### UI 개선 (기본)

- [ ] outline/page.tsx: 페이지 진입 시 기존 목차 로딩 (GET 호출)
- [ ] 기존 목차 없으면 AI 생성 or 템플릿 선택 안내
- [ ] 프로젝트 상태 업데이트 (outline_ready)

## 관련 파일

- `lib/ai/types.ts` — OutlineSectionMeta 추가
- `lib/db/schema.ts` — outlineTemplates 테이블, proposalOutlines 확장
- `lib/db/client.ts` — CREATE TABLE 추가
- `lib/validators/outline.schema.ts` — 신규
- `app/api/projects/[id]/outline/route.ts` — 신규 (GET/PUT)
- `app/api/projects/[id]/outline/generate/route.ts` — 수정
- `lib/ai/prompts/outline-generation.ts` — 프롬프트 개선
- `lib/repositories/proposal.repository.ts` — outline 메서드 보강
- `app/projects/[id]/outline/page.tsx` — 기존 목차 로딩 로직

## 의존성

- Task 011 완료 필요

## 테스트 체크리스트

- [ ] GET /api/projects/[id]/outline → 기존 목차 JSON 반환
- [ ] PUT /api/projects/[id]/outline → 수정 저장 확인
- [ ] AI 생성 결과에 meta 필드 포함 확인
- [ ] 페이지 재방문 시 기존 목차 정상 로딩
- [ ] npx tsc --noEmit 통과
- [ ] npm run build 통과
