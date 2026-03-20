# Task 052: 대화 DB 스키마 확장

## 상태: ✅ 완료

## Phase: 8 - 대화형 AI 파이프라인

## 목표

대화형 AI 코칭을 위한 DB 스키마 확장. 대화 세션, 메시지 이력, LLM 호출 로그 테이블을 추가한다.

## 배경

현재 시스템은 단방향 파이프라인(RFP→분석→전략→...→출력)으로 각 단계가 독립적 1회 LLM 호출이다. 대화형 AI를 도입하면 사용자가 각 단계에서 AI와 질문-답변을 반복하며 더 정교한 결과를 만들 수 있다.

Sequential Thinking 분석 결과: FastAPI 별도 서버 불필요. Next.js 내에서 DB 기반 대화 이력 관리로 충분.

## 구현 사항

- [ ] `conversations` 테이블 추가 (lib/db/schema.ts)
  - id, projectId, userId, topic, stageContext(JSONB), status, createdAt, lastMessageAt
- [ ] `messages` 테이블 추가
  - id, conversationId, role, content, toolCalls(JSONB), tokenUsage(JSONB), createdAt
- [ ] `llm_call_logs` 테이블 추가
  - id, projectId, conversationId(nullable), service, provider, model, promptTokens, completionTokens, totalCost, latencyMs, createdAt
- [ ] `lib/repositories/conversation.repository.ts` 신규
  - createConversation, findByProject, findById, addMessage, getMessages, updateStatus
- [ ] 시드 데이터 추가 (scripts/seed-data.ts)
  - 데모 대화 세션 + 메시지 샘플

## 관련 파일

- `lib/db/schema.ts` (수정)
- `lib/repositories/conversation.repository.ts` (신규)
- `scripts/seed-data.ts` (수정)

## 의존성

- 없음

## 테스트 체크리스트

- [ ] 스키마 마이그레이션 정상 적용
- [ ] Repository CRUD 동작 확인
- [ ] 시드 데이터 정상 입력
