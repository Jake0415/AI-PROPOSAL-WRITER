# Task 011: 전략 수립

## 상태: ✅ 완료

## Phase: 3 - RFP 업로드 & 분석

## 목표

선택된 방향성 기반으로 경쟁 전략, 차별화 포인트, 핵심 메시지를 AI가 생성.

## 구현 사항

- [x] 전략 생성 API (POST /api/projects/[id]/strategy/generate, SSE)
- [x] 전략 UI (경쟁전략/차별화포인트/핵심메시지)
- [ ] 전략 조회 API (GET /api/projects/[id]/strategy)
- [ ] 전략 수정/확정 기능
- [ ] 기존 전략 로딩 (페이지 재방문 시)

## 관련 파일

- `app/api/projects/[id]/strategy/generate/route.ts`
- `app/projects/[id]/strategy/page.tsx`

## 의존성

- Task 010 완료 필요

## 테스트 체크리스트

- [ ] 전략 생성 → 차별화 포인트 3~5개 확인
- [ ] 핵심 메시지 표시 확인
- [ ] 다음 단계 이동 정상 동작
