# Task 046: 프로젝트 목록 API 확장

## 상태: 완료

## Phase: 7 - 제안서 관리

## 목표

프로젝트 목록 조회 시 멤버/RFP 요약 정보를 함께 반환하고, 상태 필터/텍스트 검색/페이지네이션을 지원하는 API 확장.

## 배경

현재 `GET /api/projects`는 `projects` 테이블만 단순 조회하여 title, status, createdAt, updatedAt만 반환한다. 대시보드에서 RFP 분석 요약(고객명, 예산, 기간)과 담당자 정보를 표시하려면 관련 테이블을 JOIN하여 반환해야 한다.

## 기존 자산

- `projectsRelations`: members, rfpAnalyses 관계가 이미 정의됨 (`lib/db/schema.ts:348`)
- `projectMembersRelations`: user(profiles) 관계 정의됨 (`lib/db/schema.ts:361`)
- `projectMemberRepository`: addMember, removeMember, updateRole, getMembers, getMemberByUser 메서드 존재
- `GET /api/projects/[id]/members`: 개별 프로젝트 멤버 조회 API 존재
- Drizzle ORM relational query 지원: `db.query.projects.findMany({ with: {...} })`

## 구현 사항

- [ ] `lib/utils/progress.ts` 신규 - `getProjectProgress(status)` 함수
- [ ] `lib/validators/project.schema.ts` 수정 - `projectFilterSchema` 추가 (status, search, page, limit)
- [ ] `lib/repositories/project.repository.ts` 수정 - `findAllWithDetails(filters?)` 메서드 추가
- [ ] `lib/repositories/project-member.repository.ts` 수정 - `getMembersWithProfile(projectId)` 메서드 추가
- [ ] `app/api/projects/route.ts` 수정 - GET에 쿼리 파라미터 파싱 + `findAllWithDetails()` 호출
- [ ] `app/api/projects/[id]/members/route.ts` 수정 - GET에 프로필 정보 JOIN

## API 스펙

### GET /api/projects (확장)

**쿼리 파라미터**:
- `status` (optional): ProjectStatus 값으로 필터
- `search` (optional): 프로젝트 제목 검색 (ilike)
- `page` (optional, default: 1): 페이지 번호
- `limit` (optional, default: 20): 페이지당 항목 수

**응답 예시**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "2026년 클라우드 전환 사업",
      "status": "analyzing",
      "createdAt": "...",
      "updatedAt": "...",
      "members": [
        {
          "id": "member-uuid",
          "role": "owner",
          "user": { "id": "user-uuid", "name": "홍길동", "department": "제안팀", "avatarUrl": null }
        }
      ],
      "rfpAnalysis": {
        "projectName": "클라우드 전환 사업",
        "client": "행정안전부",
        "budget": "50억",
        "duration": "12개월"
      }
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

## 관련 파일

- `lib/db/schema.ts` - 스키마 및 relations (수정 없음)
- `lib/db/client.ts` - DB 클라이언트 (수정 없음)
- `lib/utils/progress.ts` - 신규
- `lib/validators/project.schema.ts` - 수정
- `lib/repositories/project.repository.ts` - 수정
- `lib/repositories/project-member.repository.ts` - 수정
- `app/api/projects/route.ts` - 수정
- `app/api/projects/[id]/members/route.ts` - 수정

## 검증

- `npx tsc --noEmit` 통과
- `npm run lint` 통과
- API 호출 테스트: `GET /api/projects?status=completed&search=클라우드`
