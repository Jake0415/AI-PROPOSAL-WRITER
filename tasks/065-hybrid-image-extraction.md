# Task 065: 하이브리드 이미지 추출 + LLM Vision 필터링

## 상태: ✅ 완료

## Phase: 9 - RFP 분석 고도화

## 목표

PyMuPDF 이미지 객체 추출 + @opendataloader/pdf imagePages 페이지 렌더링을 결합한 하이브리드 2단계 이미지 추출. LLM Vision으로 불필요한 이미지(로고, 아이콘)를 필터링하고 유의미한 이미지만 벡터화.

## 구현 사항

### 하이브리드 2단계 추출
- [x] extract-images.py: 1차 get_images() + 2차 get_pixmap() 통합
- [x] --image-pages 인자로 렌더링 대상 페이지 지정
- [x] pymupdf-extractor.ts: imagePages 파라미터 추가

### LLM Vision 필터링
- [x] image-filter.service.ts: 사전필터(100x100px) + Vision keep/skip 판정
- [x] Vision 호출 시 description + keywords 동시 생성 (비용 최적화)

### DB 스키마 확장
- [x] rfp_image_metadata: filter_status, filter_reason 컬럼 추가

### 파이프라인 확장 (7단계 → 9단계)
- [x] rag.service.ts: Step 4(1차 추출) + Step 5(2차 렌더링) + Step 6(필터링) + Step 7(벡터 저장)

### FE
- [x] vector-registration-panel: 추출/필터/최종 이미지 수 표시

## 수정 파일

| 파일 | 변경 |
| ---- | ---- |
| scripts/extract-images.py | 2단계 추출 (get_images + get_pixmap) |
| lib/vector/pymupdf-extractor.ts | imagePages 파라미터 추가 |
| lib/vector/image-filter.service.ts | 신규: Vision 필터링 |
| lib/vector/rag.service.ts | 9단계 파이프라인 |
| lib/db/schema.ts | filter_status, filter_reason |
| lib/repositories/image-metadata.repository.ts | 필터 상태 CRUD |
| app/api/.../vector-register/route.ts | imagePages 전달 |
| components/project/vector-registration-panel.tsx | 결과 확장 |
