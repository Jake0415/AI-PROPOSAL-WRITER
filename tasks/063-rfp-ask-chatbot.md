# Task 063: RAG 기반 RFP 질의응답 챗봇

## 상태: ✅ 완료

## Phase: 9 - RFP 분석 고도화

## 목표

AI 코칭 채팅을 RAG 기반 RFP 질의응답 보조 도구로 전환. DB 대화 저장 제거, RAG 검색 + on-demand Vision 추가, 자연어 자유 대화 프롬프트 적용.

## 구현 사항

- [x] rfp-ask 프롬프트 신규 (자연어 질의응답 전용)
- [x] defaults.ts에 rfp-ask 등록 + seed UPSERT
- [x] POST /api/projects/[id]/rfp/ask API (RAG + Vision + SSE)
- [x] AiChatPanel 재작성 (DB 제거, 로컬 state, /rfp/ask 호출)
- [x] 5개 페이지 Props 단순화 (userId/topic 제거)
- [x] 버튼 라벨: "AI 코칭" → "RFP 질문"

## 수정 파일

| 파일 | 변경 |
| ---- | ---- |
| lib/ai/prompts/rfp-ask.ts | 신규: 질의응답 프롬프트 |
| lib/ai/prompts/defaults.ts | rfp-ask 등록 |
| app/api/projects/[id]/rfp/ask/route.ts | 신규: RAG + Vision + SSE API |
| components/project/ai-chat-panel.tsx | 재작성: 로컬 state |
| app/projects/[id]/analysis/page.tsx | Props 단순화 |
| app/projects/[id]/direction/page.tsx | Props 단순화 |
| app/projects/[id]/strategy/page.tsx | Props 단순화 |
| app/projects/[id]/outline/page.tsx | Props 단순화 |
| app/projects/[id]/sections/page.tsx | Props 단순화 |
