# Task 047: 대시보드 UI 개선

## 상태: 완료

## Phase: 7 - 제안서 관리

## 의존성: Task 046 (프로젝트 목록 API 확장)

## 목표

대시보드에 필터/검색, 카드/테이블 뷰 전환, RFP 요약 정보, 담당자 아바타, 진행률 바를 표시하여 기존 제안서를 한눈에 관리할 수 있도록 개선.

## 구현 사항

- [ ] `components/project/member-avatar-group.tsx` 신규
  - 멤버 아바타 원형 그룹 (최대 3명 표시 + "+N")
  - hover 시 이름/역할 Tooltip
- [ ] `components/project/project-filter-bar.tsx` 신규
  - 상태 필터 (Select 또는 Tabs)
  - 텍스트 검색 (Input + 디바운스 300ms)
  - 뷰 모드 전환 버튼 (카드/테이블)
- [ ] `components/project/project-table.tsx` 신규
  - shadcn/ui Table 기반 테이블 뷰
  - 열: 프로젝트명, 고객명, 상태, 담당자, 예산, 진행률, 생성일
  - 행 클릭 시 프로젝트 상세로 이동
- [ ] `components/project/project-card.tsx` 수정
  - RFP 요약 정보 표시 (고객명, 예산, 기간)
  - MemberAvatarGroup 추가
  - 진행률 바 (Progress 컴포넌트) 추가
- [ ] `app/page.tsx` 수정
  - ProjectFilterBar 통합
  - 필터/검색 상태 관리 + API 호출 연동
  - 카드/테이블 뷰 전환
  - 페이지네이션 UI

## 관련 파일

- `app/page.tsx` - 수정
- `components/project/project-card.tsx` - 수정
- `components/project/member-avatar-group.tsx` - 신규
- `components/project/project-filter-bar.tsx` - 신규
- `components/project/project-table.tsx` - 신규

## 검증

- `npx tsc --noEmit` 통과
- `npm run lint` 통과
- 대시보드에서 카드/테이블 뷰 전환 확인
- 상태 필터, 텍스트 검색 동작 확인
- RFP 요약/담당자 아바타/진행률 표시 확인
