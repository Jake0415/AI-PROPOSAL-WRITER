# Task 062: 벡터 파이프라인 경량화 — pdf2pic 제거 + Vision on-demand

## 상태: ✅ 완료

## Phase: 9 - RFP 분석 고도화

## 목표

벡터 생성 시 불필요한 페이지 전체 PNG 변환(128장)과 사전 Vision 분석을 제거. PyMuPDF 개별 이미지만 추출하고, Vision 분석은 RFP 분석 시 on-demand로 수행하여 비용/시간 절약.

## 구현 사항

### 파이프라인 경량화 (10단계 → 7단계)
- [x] pdf2pic 페이지 전체 PNG 변환 제거
- [x] 벡터 생성 시 GPT Vision 호출 제거
- [x] PyMuPDF 개별 이미지만 추출 + DB 메타데이터 저장
- [x] 이미지 메타정보(파일명+페이지+크기) 기반 임베딩
- [x] pdf2pic 의존성 제거

### On-demand Vision (분석 시)
- [x] RAG 검색에서 매칭된 이미지만 선택적 Vision 분석 (최대 3장)
- [x] analyzeImageOnDemand / analyzeImagesOnDemand 함수 구현
- [x] analysis.service.ts에서 on-demand Vision 결과를 프롬프트에 추가

### FE 업데이트
- [x] "페이지 이미지" ResultItem 제거
- [x] 결과 요약 간소화

## 수정 파일

| 파일 | 변경 |
| ---- | ---- |
| lib/vector/rag.service.ts | 10→7단계, pdf2pic/Vision 제거, ragSearch에서 pageImages 제거 |
| lib/vector/pdf-image.service.ts | convertPdfToImages 등 제거, analyzeImageOnDemand 추가 |
| lib/services/analysis.service.ts | on-demand Vision 호출, Vision 분기 제거 |
| app/api/.../vector-register/route.ts | imagePages 파라미터 제거 |
| components/project/vector-registration-panel.tsx | 페이지 이미지 항목 제거 |
| package.json | pdf2pic 의존성 제거 |
