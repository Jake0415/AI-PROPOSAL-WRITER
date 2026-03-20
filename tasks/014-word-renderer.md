# Task 014: Word 문서 렌더링

## 상태: ✅ 완료

## Phase: 4 - 내용 생성 & 산출물 출력

## 목표

생성된 제안서 내용을 Word(.docx) 문서로 변환하여 다운로드할 수 있는 서비스 구현.

## 구현 사항

- [ ] Word 렌더링 서비스 (lib/services/word-renderer.service.ts)
- [ ] docx 라이브러리로 프로그래밍 방식 문서 생성
- [ ] 기본 제안서 Word 템플릿 (제목, 목차, 섹션 구조)
- [ ] 마크다운 → docx 변환 (제목, 본문, 표, 리스트)
- [ ] Mermaid 다이어그램 SVG 삽입
- [ ] Word 생성 API (POST /api/projects/[id]/output/word)
- [ ] 다운로드 API (GET /api/projects/[id]/output/[outputId]/download)

## 관련 파일

- `lib/services/word-renderer.service.ts` (신규)
- `app/api/projects/[id]/output/word/route.ts` (신규)
- `app/api/projects/[id]/output/[outputId]/download/route.ts` (신규)

## 의존성

- Task 013 완료 필요

## 테스트 체크리스트

- [ ] Word 파일 생성 → 파일 열림 확인
- [ ] 제목/본문/표 정상 렌더링
- [ ] 200페이지 기준 60초 이내 생성
