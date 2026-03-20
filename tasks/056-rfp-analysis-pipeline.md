# Task 056: RFP 분석 파이프라인 고도화

## 상태: 진행중

## Phase: 9 - RFP 분석 고도화

## 목표

RFP 분석을 1회 LLM 호출에서 7단계 체이닝으로 전환. GPT 파일 업로드, 중단/재시작, 사용자 개입, 프롬프트 자동 생성을 지원한다.

## 배경

현재 한계:
- pdf-parse 텍스트 추출만 → 표/이미지/도식 소실
- 80,000자 제한 → 대용량 RFP 내용 누락
- 1회 호출로 10개 항목 → 품질 저하
- 중간 결과 저장 없음 → 실패 시 처음부터 재시작

## 구현 사항

### Phase A: DB + 인프라

- [ ] `analysis_steps` 테이블 추가 (각 단계 결과 즉시 저장)
  - id, projectId, stepNumber, slug, status(pending/running/completed/failed), result(JSONB), promptUsed, errorMessage, createdAt, updatedAt
- [ ] `lib/repositories/analysis-step.repository.ts` 신규
- [ ] `lib/services/rfp-chunker.service.ts` 신규 — 대용량 RFP 청크 분할

### Phase B: GPT 파일 업로드

- [ ] `lib/ai/providers/gpt.ts` — uploadFile, generateWithFile 메서드 추가
- [ ] `lib/ai/providers/types.ts` — 인터페이스 확장
- [ ] `lib/ai/client.ts` — uploadFile, generateWithFile 래퍼

### Phase C: 7단계 프롬프트

- [ ] `lib/ai/prompts/defaults.ts` — 7개 단계별 프롬프트 추가
  - rfp-step1-overview, rfp-step2-evaluation, rfp-step3-requirements
  - rfp-step4-traceability, rfp-step5-qualifications
  - rfp-step6-strategy, rfp-step7-chapters
- [ ] 각 프롬프트에 "표/이미지/도식 분석" 지시 포함
- [ ] `scripts/seed-data.ts` — 7개 프롬프트 시드 추가

### Phase D: 프롬프트 자동 생성

- [ ] 메타 프롬프트 정의 (`rfp-meta-prompt-generator`)
  - "이 분석 단계에 필요한 시스템 프롬프트와 사용자 프롬프트를 생성해줘"
- [ ] `lib/services/prompt-auto-generator.service.ts` 신규
  - 단계에 프롬프트 없으면 → 메타 프롬프트로 GPT 호출 → DB 저장 → 해당 프롬프트로 분석

### Phase E: analysis.service 리팩터링

- [ ] `lib/services/analysis.service.ts` — 7단계 체이닝
  - 각 단계: 프롬프트 로드(없으면 자동 생성) → LLM 호출 → 결과 DB 저장 → 진행률 보고
  - 이전 단계 결과를 다음 단계 컨텍스트로 누적
  - GPT: file_search로 PDF 직접 분석 / Claude: 텍스트 청크 기반 폴백

### Phase F: 단계별 API

- [ ] `POST /api/projects/[id]/rfp/analyze/step/[stepNum]` — 특정 단계 실행/재실행
- [ ] `PUT /api/projects/[id]/rfp/analyze/step/[stepNum]` — 결과 직접 수정
- [ ] `GET /api/projects/[id]/rfp/analyze/steps` — 전체 단계 상태 조회
- [ ] 기존 `POST /api/projects/[id]/rfp/analyze` — 전체 실행 (호환 유지)

### Phase G: 프론트엔드 UI

- [ ] `app/projects/[id]/analysis/page.tsx` 리팩터링
  - 7단계 스테퍼 UI (각 단계별 상태 표시)
  - 각 단계 완료 후: [확인] [재실행] [편집] 버튼
  - 중단 후 재접속 시 마지막 완료 단계부터 재개
  - 프롬프트 편집 모달 (재실행 전 프롬프트 수정 가능)

## 관련 파일

- `lib/db/schema.ts` (수정 — analysis_steps 테이블)
- `lib/ai/providers/gpt.ts` (수정 — 파일 업로드)
- `lib/ai/providers/types.ts` (수정 — 인터페이스)
- `lib/ai/client.ts` (수정 — 래퍼)
- `lib/services/analysis.service.ts` (리팩터링)
- `lib/services/rfp-chunker.service.ts` (신규)
- `lib/services/prompt-auto-generator.service.ts` (신규)
- `lib/repositories/analysis-step.repository.ts` (신규)
- `lib/ai/prompts/defaults.ts` (수정 — 7개 프롬프트)
- `scripts/seed-data.ts` (수정 — 시드)
- `app/api/projects/[id]/rfp/analyze/` (수정/추가)
- `app/projects/[id]/analysis/page.tsx` (리팩터링)

## 의존성

- Task 051 완료 (파일시스템 저장)
- Task 045 완료 (프롬프트 관리 시스템)

## 테스트 체크리스트

- [ ] PDF 업로드 → GPT 파일 업로드 성공
- [ ] 7단계 순차 실행 → 각 단계 DB 저장
- [ ] 중간에 중단 → 재접속 → 마지막 단계에서 재개
- [ ] 특정 단계 재실행 (프롬프트 수정 후)
- [ ] 결과 직접 편집 → 다음 단계 진행
- [ ] 프롬프트 없는 단계 → 자동 생성 → 실행
- [ ] Claude 폴백 (텍스트 기반 체이닝)
- [ ] 대용량 PDF 청크 분할 동작
