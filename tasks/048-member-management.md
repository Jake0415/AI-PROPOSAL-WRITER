# Task 048: 담당자 관리

## 상태: 완료

## Phase: 7 - 제안서 관리

## 의존성: Task 047 (대시보드 UI 개선)

## 목표

리더(proposal_pm 이상)가 프로젝트에 담당자를 배정/역할변경/제거할 수 있는 Dialog UI와 개별 멤버 관리 API 구현.

## 구현 사항

- [ ] `app/api/projects/[id]/members/[memberId]/route.ts` 신규
  - PUT: 멤버 역할 변경 (proposal_pm 이상 권한)
  - DELETE: 멤버 제거 (proposal_pm 이상 권한)
- [ ] `components/project/member-manage-dialog.tsx` 신규
  - 현재 멤버 목록 표시 (이름/부서/역할/아바타)
  - 멤버 추가: 사용자 검색 → 선택 → 역할(owner/editor/viewer) 지정 → 추가
  - 역할 변경: DropdownMenu로 역할 전환
  - 멤버 제거: 삭제 버튼 + 확인
  - 사용자 검색 API: 기존 `/api/admin/users` 활용
  - 멤버 추가 API: `POST /api/projects/[id]/members`
- [ ] `app/page.tsx` 수정
  - MemberManageDialog 연결
  - 현재 사용자 권한에 따라 담당자 관리 버튼 조건부 표시 (proposal_pm 이상)

## API 스펙

### PUT /api/projects/[id]/members/[memberId]

**요청**: `{ "role": "editor" }`
**응답**: `{ "success": true, "data": { ...updatedMember } }`
**권한**: proposal_pm 이상

### DELETE /api/projects/[id]/members/[memberId]

**응답**: `{ "success": true }`
**권한**: proposal_pm 이상

## 관련 파일

- `app/api/projects/[id]/members/[memberId]/route.ts` - 신규
- `components/project/member-manage-dialog.tsx` - 신규
- `app/page.tsx` - 수정
- `lib/repositories/project-member.repository.ts` - 기존 활용 (removeMember, updateRole)
- `lib/auth/with-auth.ts` - 기존 활용 (requireRole)

## 검증

- `npx tsc --noEmit` 통과
- `npm run lint` 통과
- proposal_pm 로그인 → 담당자 추가/역할변경/제거 동작 확인
- viewer 로그인 → 담당자 관리 버튼 미표시 확인
