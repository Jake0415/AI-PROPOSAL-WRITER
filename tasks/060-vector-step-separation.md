# Task 060: 벡터 데이터 생성 단계 분리 + SSE 실시간 진행률

## 상태: ✅ 완료

## Phase: 9 - RFP 분석 고도화

## 우선순위: 높음

## 목표

벡터 데이터 생성을 분석 페이지의 버튼에서 독립된 파이프라인 단계로 분리. SSE 스트리밍으로 실시간 진행률(6단계 스테퍼 + 배치별 진행률)을 표시하고, 완료 후 결과 요약(청크 수, 이미지 수, 소요 시간)을 제공한다.

## 구현 사항

### 사이드바 네비게이션 (11단계)
- [x] StepNavigation STEPS 배열에 vectorize 단계 추가 (upload 다음)
- [x] STATUS_ORDER에 vectorized 상태 추가
- [x] ProjectStatus 타입에 vectorized 추가

### 벡터 생성 전용 페이지
- [x] app/projects/[id]/vectorize/page.tsx 신규 생성
- [x] VectorRegistrationPanel 컴포넌트 배치

### SSE 스트리밍 진행률
- [x] embedding.service.ts: createEmbeddingsWithProgress() 추가
- [x] rag.service.ts: SSEProgress 콜백 + 6단계 라벨 + 배치별 진행률
- [x] vector-register API: createSSEResponse() 래퍼로 전환
- [x] 반환 타입 확장: elapsedMs, embeddingModel, chunkSizeTokens

### UI 컴포넌트
- [x] VectorRegistrationPanel: 상태별 UI (미등록/진행중/완료/실패)
- [x] 6단계 미니 스테퍼 + 프로그레스바
- [x] 결과 요약 카드 (localStorage 캐시)

### 분석 페이지 정리
- [x] analysis/page.tsx에서 벡터 관련 UI/로직 제거

### 상태 전이
- [x] 벡터 등록 완료 시: 프로젝트 상태 uploaded → vectorized
