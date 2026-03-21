# Task 058: Qdrant 기반 RAG + Vision 하이브리드 분석

## 상태: 진행중

## Phase: 9 - RFP 분석 고도화

## 목표

OpenAI Vector Store 대신 로컬 Qdrant를 사용하여 텍스트 벡터 + 이미지를 관리. 벡터 등록 시 PDF를 청크 분할 → 임베딩 → Qdrant 저장 + 페이지별 이미지 변환. 분석 시 RAG 검색 + GPT-4o Vision으로 표/도표 분석.

## 구현 사항

### 인프라
- [ ] docker-compose.yml에 Qdrant 서비스 추가 (qdrant/qdrant:latest, :6333)
- [ ] Dockerfile에 graphicsmagick 설치 (PDF→이미지 변환)
- [ ] @qdrant/js-client-rest, pdf2pic 패키지 설치

### 벡터 서비스 (lib/vector/)
- [ ] qdrant-client.ts — Qdrant 연결, collection CRUD, point 삽입/검색
- [ ] embedding.service.ts — OpenAI text-embedding-3-small 임베딩 생성
- [ ] pdf-image.service.ts — PDF → 페이지별 PNG 변환
- [ ] rag.service.ts — RAG 검색 (쿼리 임베딩 → 유사 청크 + 관련 이미지)

### 벡터 등록 파이프라인
- [ ] 텍스트: PDF → 청크 분할(500자, 100자 오버랩) → 임베딩 → Qdrant
- [ ] 이미지: PDF → 페이지별 PNG → data/uploads/[projectId]/pages/
- [ ] DB: rfp_files.vectorStatus = 'completed'

### 분석 연동
- [ ] analysis.service.ts — RAG 검색 → 관련 텍스트 + 이미지 → GPT-4o
- [ ] gpt.ts — Vision API (이미지 base64 첨부)
- [ ] rfp-steps.ts — rawText 제거, 지시만 포함

### API
- [ ] vector-register API — Qdrant 등록 흐름으로 변경

## 관련 파일

- `docker-compose.yml` (수정)
- `Dockerfile` (수정)
- `lib/vector/qdrant-client.ts` (신규)
- `lib/vector/embedding.service.ts` (신규)
- `lib/vector/pdf-image.service.ts` (신규)
- `lib/vector/rag.service.ts` (신규)
- `lib/db/schema.ts` (수정 — vectorStatus)
- `lib/ai/providers/gpt.ts` (수정 — Vision)
- `lib/ai/prompts/rfp-steps.ts` (수정)
- `lib/services/analysis.service.ts` (수정)
- `app/api/projects/[id]/rfp/vector-register/route.ts` (수정)

## 의존성

- Task 056 완료 (7단계 분석 파이프라인)
- Task 057 완료 (API 키 DB 관리)
