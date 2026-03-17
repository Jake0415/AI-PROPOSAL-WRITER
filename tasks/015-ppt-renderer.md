# Task 015: PPT 장표 렌더링

## 상태: 대기

## Phase: 4 - 내용 생성 & 산출물 출력

## 목표

발표용 요약 PPT(.pptx) 장표를 자동 생성하여 다운로드할 수 있는 서비스 구현.

## 구현 사항

- [ ] PPT 렌더링 서비스 (lib/services/ppt-renderer.service.ts)
- [ ] pptxgenjs 기반 슬라이드 생성
- [ ] 발표용 레이아웃 (표지, 목차, 핵심 내용 요약, 다이어그램)
- [ ] 각 섹션의 핵심 내용을 슬라이드로 변환
- [ ] PPT 생성 API (POST /api/projects/[id]/output/ppt)

## 관련 파일

- `lib/services/ppt-renderer.service.ts` (신규)
- `app/api/projects/[id]/output/ppt/route.ts` (신규)

## 의존성

- Task 013 완료 필요

## 테스트 체크리스트

- [ ] PPT 파일 생성 → 파일 열림 확인
- [ ] 표지/목차/내용 슬라이드 정상
- [ ] 다이어그램 슬라이드 포함
