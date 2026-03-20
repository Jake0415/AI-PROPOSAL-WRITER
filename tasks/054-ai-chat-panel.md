# Task 054: AI 채팅 패널 UI

## 상태: 대기

## Phase: 8 - 대화형 AI 파이프라인

## 목표

각 단계 페이지에서 AI와 대화할 수 있는 우측 슬라이드 패널 UI를 구현한다.

## 구현 사항

- [ ] `components/project/ai-chat-panel.tsx` 신규
  - 우측 슬라이드 패널 (Sheet 컴포넌트 활용)
  - 메시지 목록 (스크롤, 최신 메시지 자동 스크롤)
  - 입력 폼 (텍스트 입력 + 전송 버튼)
  - SSE 스트리밍 응답 실시간 표시 (기존 `lib/hooks/use-sse.ts` 재활용)
  - 마크다운 렌더링 (assistant 메시지)
  - 대화 세션 관리 (새 대화, 이전 대화 목록)
  - 로딩/에러 상태 표시

- [ ] 각 단계 페이지에 채팅 버튼 추가
  - analysis, direction, strategy, outline, sections, review 페이지
  - 플로팅 버튼 또는 헤더 영역 버튼
  - 클릭 시 해당 단계의 topic으로 대화 시작

- [ ] 관리자 LLM 사용량 페이지
  - `/admin/llm-logs` 페이지
  - 프로바이더별/서비스별 토큰 사용량, 비용 요약

## 관련 파일

- `components/project/ai-chat-panel.tsx` (신규)
- `app/projects/[id]/analysis/page.tsx` (수정 - 채팅 버튼)
- `app/projects/[id]/direction/page.tsx` (수정)
- `app/projects/[id]/strategy/page.tsx` (수정)
- `app/projects/[id]/outline/page.tsx` (수정)
- `app/projects/[id]/sections/page.tsx` (수정)
- `app/projects/[id]/review/page.tsx` (수정)
- `app/admin/llm-logs/page.tsx` (신규)

## 의존성

- Task 053 완료 필요

## 테스트 체크리스트

- [ ] 채팅 패널 열기/닫기
- [ ] 메시지 전송 → 스트리밍 응답 표시
- [ ] 대화 이력 유지 (페이지 새로고침 후)
- [ ] 각 단계별 채팅 버튼 표시
- [ ] LLM 사용량 대시보드 표시
