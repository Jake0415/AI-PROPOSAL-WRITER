# Task 061: PDF 마크다운 변환 + 이미지 메타데이터 벡터화 + GPT-5.x API 호환

## 상태: ✅ 완료

## Phase: 9 - RFP 분석 고도화

## 우선순위: 높음

## 목표

pdf-parse를 @opendataloader/pdf로 교체하여 표를 마크다운으로 보존. 청크 사이즈 4096→2048 축소. 이미지/도표가 있는 페이지만 선택적으로 PNG 변환 후 GPT Vision으로 설명+키워드를 생성하여 Qdrant에 벡터화. RAG 검색 시 키워드 매칭되면 해당 이미지를 LLM에 전달. GPT-5.x 시리즈의 max_tokens→max_completion_tokens API 변경 대응.

## 구현 사항

### 인프라

- [x] Dockerfile: Java 11 JRE 설치 (runner 스테이지)
- [x] package.json: @opendataloader/pdf@2.0.2 추가

### DB 스키마

- [x] rfp_files 테이블에 imagePages (jsonb) 컬럼 추가

### PDF 파서 교체

- [x] rfp-parser.service.ts: @opendataloader/pdf로 교체
- [x] ParseResult에 imagePages 필드 추가
- [x] 마크다운 출력 (표 구조 보존)
- [x] JSON 메타데이터에서 figure/image 페이지 감지
- [x] pdf-parse 폴백 (Java 미설치 시)

### 업로드 라우트

- [x] upload/route.ts: imagePages DB 저장
- [x] rfp.repository.ts: imagePages CRUD

### 청킹 최적화

- [x] embedding.service.ts: CHUNK_SIZE 4096→2048
- [x] 토큰 추정 함수 + tokensToChars 역변환
- [x] createEmbeddingsWithProgress: 배치별 진행률 콜백

### 이미지 메타데이터 생성

- [x] pdf-image.service.ts: convertSelectivePdfToImages (선택적 페이지 변환)
- [x] pdf-image.service.ts: generateImageMetadata (GPT Vision → description + keywords)
- [x] generateBatchImageMetadata: 최대 20페이지, 동시 3개 병렬 처리

### 벡터 생성 파이프라인 (8단계 SSE)

- [x] rag.service.ts: 8단계 (기존벡터초기화→청크분할→임베딩→텍스트저장→이미지변환→메타생성→이미지저장→완료)
- [x] Qdrant point type='image' 페이로드: {description, keywords, pageNumber, imagePath}
- [x] VectorRegistrationResult에 imageChunkCount 추가

### RAG 검색 강화

- [x] ragSearch: text + image 포인트 분리 반환
- [x] RagSearchResult에 imageMatches 필드 추가
- [x] image 매칭 시 해당 페이지 PNG 자동 포함

### 분석 서비스 연동

- [x] analysis.service.ts: imageMatches를 프롬프트에 이미지 설명으로 추가
- [x] Vision API에 매칭된 페이지 PNG 전달

### GPT-5.x API 호환성 수정

- [x] models.ts: isGpt5Model() 헬퍼 함수 (GPT-5.x 모델 판별)
- [x] gpt.ts: generateText/generateStream에서 max_tokens→max_completion_tokens 분기
- [x] pdf-image.service.ts: hard-coded gpt-4o → 설정 모델 사용 + 분기
- [x] analysis.service.ts: Vision API 호출 모델별 분기

### UI 업데이트

- [x] vector-registration-panel.tsx: 결과에 이미지 청크 수 표시
- [x] vector-register/route.ts: imagePages 전달
- [x] step-navigation.tsx: "분석 결과" → "RFP 분석" 라벨 변경
- [x] vectorize/page.tsx: 완료 후 "다음 단계: RFP 분석" 버튼 + router.refresh()

## 수정 파일

| 파일 | 변경 |
|------|------|
| Dockerfile | Java 11 JRE |
| package.json | @opendataloader/pdf |
| lib/db/schema.ts | imagePages 컬럼 |
| lib/services/rfp-parser.service.ts | @opendataloader/pdf + 폴백 |
| lib/vector/embedding.service.ts | 2048토큰 + 토큰추정 + 배치진행률 |
| lib/vector/pdf-image.service.ts | 선택적변환 + Vision메타 + GPT-5.x분기 |
| lib/vector/rag.service.ts | 8단계SSE + 이미지벡터 + 검색강화 |
| lib/ai/models.ts | isGpt5Model() 헬퍼 |
| lib/ai/providers/gpt.ts | max_completion_tokens 분기 |
| lib/services/analysis.service.ts | 이미지메타프롬프트 + Vision분기 |
| app/api/.../rfp/upload/route.ts | imagePages 저장 |
| app/api/.../rfp/vector-register/route.ts | imagePages 전달 |
| components/project/vector-registration-panel.tsx | 이미지청크수 표시 |
| components/project/step-navigation.tsx | RFP 분석 라벨 |
| app/projects/[id]/vectorize/page.tsx | 다음단계 버튼 + refresh |
