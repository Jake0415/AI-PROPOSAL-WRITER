# Task 064: RAG 검색 성능 개선

## 상태: ✅ 완료

## Phase: 9 - RFP 분석 고도화

## 목표

RAG 검색 품질 개선. 줄 단위 청킹 → 구조 인식 청킹, 과대 청크 축소, Step 분석 쿼리 구체화, 점수 임계값 필터링.

## 구현 사항

### 구조 인식 청킹
- [x] 마크다운 섹션(##, ###) 단위로 분할
- [x] 테이블(파이프 | 연속 줄)은 하나의 청크로 유지
- [x] 청크 사이즈: 2048 → 1024 토큰
- [x] 토큰 추정: 1.0 → 1.3 (한국어 비중 반영)

### Step 분석 쿼리 개선
- [x] Step 라벨("사업 개요 파악") 대신 구체적 검색 키워드 사용
- [x] RFP_STEP_DEFINITIONS에 searchQuery 필드 추가

### 점수 임계값
- [x] Qdrant searchPoints에 score_threshold: 0.4 추가
- [x] 낮은 유사도 결과 자동 필터링

## 수정 파일

| 파일 | 변경 |
| ---- | ---- |
| lib/vector/embedding.service.ts | 구조 인식 청킹 + 1024토큰 + 1.3 비율 |
| lib/ai/prompts/rfp-steps.ts | RFP_STEP_DEFINITIONS에 searchQuery 추가 |
| lib/services/analysis.service.ts | stepDef.searchQuery로 RAG 검색 |
| lib/vector/qdrant-client.ts | score_threshold 파라미터 추가 |
| lib/vector/rag.service.ts | score_threshold 전달 |
