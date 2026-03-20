# Task 017: 사용자 템플릿 관리

## 상태: 진행중

## Phase: 5 - 고도화

## 목표

사용자가 자체 Word/PPT 템플릿을 업로드하고, 해당 양식에 맞춰 제안서를 자동 채우는 기능.

## 구현 사항

- [ ] 템플릿 업로드 API (POST /api/templates/upload)
- [ ] 템플릿 목록 API (GET /api/templates)
- [ ] 템플릿 삭제 API (DELETE /api/templates/[id])
- [ ] 템플릿 관리 UI (app/templates/page.tsx)
- [ ] docxtemplater 기반 템플릿 채움 서비스
- [ ] 출력 페이지에 템플릿 선택 기능 추가

## 관련 파일

- `app/templates/page.tsx` (신규)
- `app/api/templates/` (신규)
- `lib/services/template.service.ts` (신규)

## 의존성

- Task 014 완료 필요

## 테스트 체크리스트

- [ ] 템플릿 업로드 → 목록 표시
- [ ] 템플릿 선택 → 해당 양식으로 출력
- [ ] 템플릿 삭제 정상 동작
