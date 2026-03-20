# Task 045: 프롬프트 관리 시스템

## 상태: ✅ 완료

## Phase: 6 - 운영 및 배포

## 목표

9개 LLM 프롬프트를 기능/내용/용도로 정의하고, 관리자가 UI에서 조회/수정/테스트할 수 있는 프롬프트 관리 시스템 구축. DB 기반 관리 + 코드 기본값 fallback + 버전 이력 관리.

## 대상 프롬프트 (9개)

| slug | 기능 | 용도 | maxTokens |
| --- | --- | --- | --- |
| rfp-analysis | RFP 문서 분석 | 사업개요·평가항목·요구사항·추적성 추출 | 16,384 |
| direction-generation | 방향성 생성 | 3~5개 제안 방향 후보 생성 | 4,096 |
| strategy-generation | 전략 수립 | 경쟁전략·차별화·핵심메시지 | 4,096 |
| outline-generation | 목차 생성 | 계층형 목차 구조 생성 | 4,096 |
| section-generation | 섹션 작성 | 개별 섹션 본문+다이어그램 | 4,096 |
| review-generation | 제안서 검증 | 평가항목별 점수·충족도·개선안 | 16,384 |
| price-generation | 가격 산출 | 사업비 산출내역서 | 8,192 |
| coaching | AI 코칭 | 단계별 피드백·개선제안 | 4,096 |
| competitive-analysis | 경쟁 분석 | SWOT·경쟁환경·시사점 | 4,096 |

## 구현 사항

- [x] PRD 업데이트 (F-112 추가)
- [x] ROADMAP 업데이트 (Task 045 추가)
- [ ] DB 스키마: prompt_templates + prompt_template_versions 테이블
- [ ] 기본값 레지스트리 (lib/ai/prompts/defaults.ts)
- [ ] 템플릿 엔진 (lib/ai/prompts/template-engine.ts)
- [ ] Repository (lib/repositories/prompt-template.repository.ts)
- [ ] Service (lib/services/prompt.service.ts) — getPrompt(slug) 핵심
- [ ] 기존 9개 서비스/라우트에서 getPrompt() 호출로 변경
- [ ] API Routes:
  - GET/POST /api/admin/prompts
  - GET/PUT/DELETE /api/admin/prompts/[slug]
  - GET /api/admin/prompts/[slug]/versions
  - POST /api/admin/prompts/[slug]/test
  - POST /api/admin/prompts/[slug]/revert
- [ ] 관리자 UI:
  - app/admin/prompts/page.tsx (목록)
  - app/admin/prompts/[slug]/page.tsx (편집)
  - components/admin/prompt-editor.tsx
  - components/admin/prompt-version-history.tsx
  - components/admin/prompt-test-panel.tsx
- [ ] navbar.tsx에 프롬프트 관리 링크 추가

## 핵심 설계

- **DB 우선, 코드 fallback**: DB에 오버라이드 있으면 사용, 없으면 코드 기본값
- **Lazy Creation**: 관리자가 처음 수정할 때 DB 레코드 자동 생성
- **버전 자동 관리**: 수정 시 이전 버전을 prompt_template_versions에 자동 보관
- **캐시**: 인메모리 5분 TTL, 수정 시 즉시 무효화

## 관련 파일

- `lib/db/schema.ts` — 테이블 추가
- `lib/ai/prompts/*.ts` — 기존 프롬프트 (유지, defaults.ts에서 re-export)
- `lib/ai/prompts/defaults.ts` — 신규: 기본값 레지스트리
- `lib/services/prompt.service.ts` — 신규: getPrompt() 핵심
- `lib/repositories/prompt-template.repository.ts` — 신규
- `app/api/admin/prompts/` — 신규: API Routes
- `app/admin/prompts/` — 신규: 관리자 UI

## 의존성

- Task 030 (관리자 대시보드) 완료 필요 ✅
- Task 031 (감사 로그) — 감사 로그 연동

## 테스트 체크리스트

- [ ] 관리자 UI에서 9개 프롬프트 목록 확인 (source: default)
- [ ] 프롬프트 수정 → 저장 → 해당 기능 실행 → DB 프롬프트 사용 확인
- [ ] "기본값 복원" → 코드 기본값으로 복원 확인
- [ ] 버전 이력 조회 + 되돌리기
- [ ] 테스트 실행 → LLM 응답 미리보기
