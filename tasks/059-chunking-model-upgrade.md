# Task 059: RAG 청킹 최적화 + GPT-5.x 모델 지원

## 상태: ✅ 완료

## Phase: 9 - RFP 분석 고도화

## 우선순위: 높음

## 목표

RAG 청킹 사이즈를 500자에서 4096토큰으로 업그레이드하고, GPT-5.4 시리즈를 모델 목록에 추가하며, 모델 관리를 중앙화한다.

## 배경

- 현재 500자(약 250토큰) 청킹은 2026년 기준 지나치게 작아 문맥이 파편화됨
- 2026년 2월 벤치마크: recursive 512-token splitting이 69% 정확도 (1위)
- NVIDIA 연구: 1024 토큰 + 15% 오버랩 최적
- text-embedding-3-small 모델 한도: 8191 토큰 → 4096 토큰 청크 안전
- GPT-5.4 (2026-03-05 출시): 1.05M 컨텍스트 윈도우, 기존 4o 대비 성능 향상
- 모델 목록이 설정 페이지에 하드코딩되어 유지보수 어려움

## 구현 사항

### 청킹 최적화 (lib/vector/embedding.service.ts)
- [ ] CHUNK_SIZE: 500자 → 4096토큰 (간이 토큰 추정 함수 적용)
- [ ] CHUNK_OVERLAP: 100자 → 200토큰
- [ ] estimateTokens() 함수 추가 (한국어 혼합 문서 기준)

### RAG 검색 조정 (lib/vector/rag.service.ts)
- [ ] topK: 10 → 15
- [ ] 최대 이미지: 3 → 5

### 모델 목록 중앙 관리 (lib/ai/models.ts 신규)
- [ ] CLAUDE_MODELS, GPT_MODELS 배열 정의
- [ ] DEFAULT_CLAUDE_MODEL, DEFAULT_GPT_MODEL 상수 export
- [ ] GPT-5.4, GPT-5.4 mini, GPT-5.4 Pro 추가
- [ ] GPT-4.1, GPT-4.1 mini 추가
- [ ] GPT-4o, GPT-4o mini (레거시) 유지

### 기본 모델 업데이트 (6곳)
- [ ] lib/db/schema.ts: gpt-4o → gpt-5.4-mini
- [ ] lib/ai/providers/gpt.ts: DEFAULT_MODEL → models.ts import
- [ ] lib/ai/client.ts: AI_MODEL → models.ts import
- [ ] lib/repositories/settings.repository.ts: gpt-4o → models.ts import
- [ ] scripts/seed-data.ts: gpt-4o → gpt-5.4-mini
- [ ] app/settings/page.tsx: 하드코딩 models → models.ts import

### 문서 현행화
- [ ] PRD: F-153, F-154 추가
- [ ] ROADMAP: Task 059 추가, 카운터 업데이트
- [ ] Task 058: 청킹 설명 보완
