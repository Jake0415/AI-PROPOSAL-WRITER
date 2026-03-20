# Task 057: API 키 DB 관리

## 상태: ✅ 완료

## Phase: 6 - 운영 및 배포

## 목표

AI API 키(Claude, OpenAI)를 환경변수 대신 DB에 암호화 저장하여 설정 페이지에서 관리.

## 구현 사항

- [x] `lib/security/encrypt.ts` — AES-256-GCM 암복호화
- [x] `lib/db/schema.ts` — ai_settings에 claudeApiKey, gptApiKey 추가
- [x] `lib/repositories/settings.repository.ts` — 키 암호화 저장/복호화 조회
- [x] `lib/ai/providers/gpt.ts` — DB 키 우선 사용, 환경변수 폴백
- [x] `lib/ai/providers/claude.ts` — 동일 패턴
- [x] `app/api/settings/ai/route.ts` — 키 저장/마스킹 반환
- [x] `app/settings/page.tsx` — API 키 입력 UI + 마스킹 표시

## 관련 파일

- `lib/security/encrypt.ts` (신규)
- `lib/db/schema.ts` (수정)
- `lib/repositories/settings.repository.ts` (수정)
- `lib/ai/providers/gpt.ts` (수정)
- `lib/ai/providers/claude.ts` (수정)
- `app/api/settings/ai/route.ts` (수정)
- `app/settings/page.tsx` (수정)
