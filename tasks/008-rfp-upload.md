# Task 008: RFP 업로드

## 상태: ✅ 완료

## Phase: 3 - RFP 업로드 & 분석

## 목표

RFP 파일(PDF/DOCX) 업로드 UI와 API, 텍스트 추출 파싱 서비스 구현.

## 구현 사항

- [x] 드래그앤드롭 업로드 UI (app/projects/[id]/upload/page.tsx)
- [x] 파일 업로드 API (POST /api/projects/[id]/rfp/upload)
- [x] RFP 파싱 서비스 (PDF: @opendataloader/pdf, DOCX: mammoth)
- [x] 업로드 완료 시 드롭존 비활성화 + 파일 정보 카드 표시
- [x] 파일 삭제 기능 (DELETE API) — vectorStatus='none'일 때만 허용
- [x] 벡터 데이터 생성 시작 후 삭제 불가 안내
- [x] 업로드 완료 후 벡터 생성 페이지로 리다이렉트
- [x] 파일 저장 (data/uploads/[projectId]/)
- [x] AI 분석 프롬프트 5종 설계 (분석/방향/전략/목차/섹션)

## 관련 파일

- `app/projects/[id]/upload/page.tsx`
- `app/api/projects/[id]/rfp/upload/route.ts`
- `lib/services/rfp-parser.service.ts`
- `lib/ai/prompts/rfp-steps.ts` (7단계 분석 프롬프트)
- `lib/ai/prompts/direction-generation.ts`
- `lib/ai/prompts/strategy-generation.ts`
- `lib/ai/prompts/outline-generation.ts`
- `lib/ai/prompts/section-generation.ts`

## 변경 사항 요약

RFP 업로드 전체 파이프라인(UI→API→파싱→저장)과 AI 프롬프트 5종 구현 완료.
