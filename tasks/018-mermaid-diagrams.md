# Task 018: Mermaid 다이어그램

## 상태: 대기

## Phase: 5 - 고도화

## 목표

기술 섹션에 AI가 Mermaid 다이어그램을 자동 생성하고 미리보기를 제공.

## 구현 사항

- [ ] 다이어그램 생성 프롬프트 (lib/ai/prompts/diagram-generation.ts)
- [ ] MermaidPreview 컴포넌트 (SVG 렌더링)
- [ ] 섹션 편집기에 다이어그램 탭 추가
- [ ] 다이어그램 코드 편집 기능
- [ ] Word/PPT 출력에 다이어그램 SVG 삽입

## 관련 파일

- `components/proposal/mermaid-preview.tsx` (신규)
- `lib/ai/prompts/diagram-generation.ts` (신규)

## 의존성

- Task 013 완료 필요

## 테스트 체크리스트

- [ ] Mermaid 코드 → SVG 렌더링 확인
- [ ] 다이어그램 편집 → 실시간 미리보기
- [ ] Word 출력에 다이어그램 포함
