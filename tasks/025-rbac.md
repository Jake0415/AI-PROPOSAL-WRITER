# Task 025: RBAC 역할 기반 접근제어

## 상태: ✅ 완료

## Phase: 2.5 - 프로덕션 기반 인프라

## 우선순위: 긴급 (CRITICAL)

## 목표

admin/proposal_pm/tech_writer/viewer 역할별 접근 권한을 정의하고 API/UI에 적용한다.

## 역할 정의

| 역할 | 설명 | 권한 |
| --- | --- | --- |
| admin | 전체 관리 | 모든 접근, 사용자/설정 관리 |
| proposal_pm | 제안 PM | 프로젝트 생성/관리, 전 단계 실행 |
| tech_writer | 기술 작성자 | 할당된 프로젝트의 섹션 편집만 |
| viewer | 조회자 | 읽기 전용, 산출물 다운로드 |

## 구현 사항

- [ ] 권한 매트릭스 (lib/auth/permissions.ts)
- [ ] withAuth 미들웨어 헬퍼 (API용)
- [ ] project_members 테이블 (projectId, userId, role)
- [ ] 프로젝트 멤버 관리 API (POST/DELETE /api/projects/[id]/members)
- [ ] 관리자: 사용자 목록/초대/역할변경 API
- [ ] RoleGate UI 컴포넌트 (역할별 조건부 렌더링)

## 관련 파일

- `lib/auth/permissions.ts` (신규)
- `lib/auth/with-auth.ts` (신규)
- `lib/db/schema.ts` (project_members)
- `app/api/projects/[id]/members/route.ts` (신규)
- `app/api/admin/users/route.ts` (신규)
- `components/auth/role-gate.tsx` (신규)

## 의존성

- Task 024 완료 필요

## 테스트 체크리스트

- [ ] admin: 모든 API 접근 가능
- [ ] tech_writer: 프로젝트 생성 불가 (403)
- [ ] viewer: 수정 API 접근 불가 (403)
- [ ] 프로젝트 멤버만 해당 프로젝트 접근 가능
