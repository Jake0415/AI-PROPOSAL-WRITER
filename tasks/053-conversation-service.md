# Task 053: 대화형 AI 서비스 + API

## 상태: 대기

## Phase: 8 - 대화형 AI 파이프라인

## 목표

대화형 AI 코칭 서비스와 API 엔드포인트를 구현한다. 사용자가 각 단계에서 AI와 질문-답변을 반복하며, 이전 대화 이력과 프로젝트 컨텍스트를 활용한 응답을 생성한다.

## 구현 사항

### 서비스 레이어

- [ ] `lib/services/conversation.service.ts` 신규
  - startConversation(projectId, userId, topic) → conversationId
  - sendMessage(conversationId, userMessage) → AsyncGenerator<string> (SSE 스트리밍)
    - 이전 메시지 이력 로드 → 프롬프트에 컨텍스트 주입 → LLM 호출 → 응답+토큰 저장
  - getHistory(conversationId) → Message[]
  - archiveConversation(conversationId)

- [ ] `lib/services/ai-pipeline.ts` 신규
  - 단계별 오케스트레이션 (이전 단계 결과를 자동으로 다음 프롬프트에 주입)
  - 프로젝트 상태에 따른 적절한 컨텍스트 수집

- [ ] `lib/ai/client.ts` 수정
  - generateText/generateStream에서 토큰 사용량 반환 추가
  - LLM 호출마다 llm_call_logs에 자동 기록

### API 엔드포인트

- [ ] `POST /api/projects/[id]/conversations` — 대화 시작
- [ ] `POST /api/projects/[id]/conversations/[convId]/messages` — 메시지 전송 (SSE)
- [ ] `GET /api/projects/[id]/conversations` — 대화 목록
- [ ] `GET /api/projects/[id]/conversations/[convId]` — 대화 상세 (이력 포함)
- [ ] `DELETE /api/projects/[id]/conversations/[convId]` — 대화 아카이브
- [ ] `GET /api/admin/llm-logs` — LLM 사용량 대시보드 (관리자)

## 관련 파일

- `lib/services/conversation.service.ts` (신규)
- `lib/services/ai-pipeline.ts` (신규)
- `lib/ai/client.ts` (수정)
- `app/api/projects/[id]/conversations/` (신규, 3개 라우트)
- `app/api/admin/llm-logs/route.ts` (신규)

## 의존성

- Task 052 완료 필요

## 테스트 체크리스트

- [ ] 대화 시작 → 메시지 전송 → SSE 스트리밍 응답
- [ ] 대화 이력 조회 시 이전 메시지 포함
- [ ] LLM 호출 로그에 토큰/비용 기록
- [ ] 관리자 LLM 로그 API 동작
