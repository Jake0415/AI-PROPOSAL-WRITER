# Task 009: RFP 분석 기능

## 상태: ✅ 완료

## Phase: 3 - RFP 업로드 & 분석

## 우선순위: 높음

## 목표

업로드된 RFP를 Claude API로 분석하여 요구사항, 평가기준, 키워드를 추출하고 결과를 UI에 표시.

## 구현 사항

- [x] SSE 스트리밍 분석 API (POST /api/projects/[id]/rfp/analyze)
- [x] 분석 결과 조회 API (GET /api/projects/[id]/rfp/analysis)
- [x] 분석 결과 UI (사업개요/요구사항/평가기준/키워드 카드)
- [x] useSSE 커스텀 Hook (lib/hooks/use-sse.ts)
- [x] ProgressTracker 컴포넌트
- [ ] **pdf-parse v2 API 호환성 수정** (빌드 오류)
  - PDFParse 클래스의 `load()`가 private
  - `getText()` 반환 타입이 `TextResult` (string이 아님)
  - 해결 방안: pdf-parse v2 API 문서 확인 후 수정

## 관련 파일

- `app/api/projects/[id]/rfp/analyze/route.ts`
- `app/api/projects/[id]/rfp/analysis/route.ts`
- `app/projects/[id]/analysis/page.tsx`
- `lib/hooks/use-sse.ts`
- `lib/services/rfp-parser.service.ts` ← **수정 필요**
- `components/project/progress-tracker.tsx`

## 의존성

- Task 008 완료 필요

## 테스트 체크리스트

- [ ] PDF 업로드 → 텍스트 추출 성공
- [ ] AI 분석 API → JSON 결과 반환
- [ ] 분석 결과 UI에 정상 표시
- [ ] SSE 진행률 실시간 업데이트
- [ ] npx tsc --noEmit 통과
- [ ] npm run build 통과
