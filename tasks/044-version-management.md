# Task 044: 제안서 버전 관리 + 비교

## 상태: 대기

## Phase: 4 - 수주 최적화 고도화

## 우선순위: 중간 (P1)

## 목표

제안서의 모든 상태(섹션 내용, 목차, 전략 등)를 버전별로 스냅샷 저장하고, 두 버전 간 차이를 비교(diff)하며, 이전 버전으로 복원할 수 있는 버전 관리 시스템을 구현한다.

## 요구사항

- [ ] 버전 저장 API (POST /api/projects/[id]/versions) — 현재 상태 스냅샷
- [ ] 버전 목록 조회 API (GET /api/projects/[id]/versions)
- [ ] 버전 상세 조회 API (GET /api/projects/[id]/versions/[versionId])
- [ ] 버전 비교 API (GET /api/projects/[id]/versions/compare?v1=X&v2=Y)
- [ ] 버전 복원 API (POST /api/projects/[id]/versions/[versionId]/restore)
- [ ] 버전 관리 UI 페이지 (app/projects/[id]/versions/page.tsx)
- [ ] VersionTimeline 컴포넌트 — 버전 타임라인 표시
- [ ] 버전 diff 뷰 — 두 버전 간 변경 사항 하이라이트
- [ ] 자동 버전 생성 — 주요 단계 완료 시 자동 스냅샷
- [ ] 수동 버전 생성 — 사용자가 라벨을 붙여 저장
- [ ] ProposalVersion 타입 정의
- [ ] version.repository.ts — DB CRUD
- [ ] version.service.ts — 스냅샷 생성/복원 로직

## 기술 상세

### 스냅샷 구조

버전 스냅샷은 프로젝트의 전체 상태를 JSONB로 저장:
```typescript
interface VersionSnapshot {
  outline: OutlineSection[];        // 목차
  sections: ProposalSection[];      // 섹션 내용
  strategy: ProposalStrategy;       // 전략
  direction: ProposalDirection;     // 방향성
  reviewReport?: ReviewReport;      // 검증 리포트
  priceProposal?: PriceProposal;   // 가격 제안서
}
```

### 자동 버전 생성 트리거

- 전략 확정 시 (게이트 1 통과)
- 내용 생성 완료 시 (게이트 2 통과)
- 검증 리포트 생성 시
- 산출물 출력 시

### Diff 알고리즘

섹션 내용 비교: 텍스트 diff (diff-match-patch 라이브러리)
- 추가된 텍스트: 녹색 배경
- 삭제된 텍스트: 빨간색 배경 + 취소선
- 변경 통계: 추가/삭제/수정된 섹션 수

### DB 스키마

`proposal_versions` 테이블: id, project_id, version_number (INTEGER), label (TEXT), snapshot (JSONB), created_at (TIMESTAMPTZ), created_by (TEXT, user_id)

### UI 구성

- 좌측: 버전 타임라인 (세로 스크롤)
  - 각 항목: 버전 번호, 라벨, 생성 시각, 생성자
  - 자동 버전: 시스템 아이콘, 수동 버전: 사용자 아이콘
- 우측 상단: "새 버전 저장" 버튼 + 라벨 입력
- 우측 중앙: 버전 비교 영역
  - 두 버전 선택 드롭다운 (v1, v2)
  - 섹션별 diff 뷰 (추가/삭제/변경 하이라이트)
  - 변경 통계 요약
- 우측 하단: "이 버전으로 복원" 버튼 (확인 다이얼로그)

## 관련 파일

- `lib/services/version.service.ts` — 신규
- `lib/repositories/version.repository.ts` — 신규
- `app/api/projects/[id]/versions/route.ts` — 신규
- `app/api/projects/[id]/versions/[versionId]/route.ts` — 신규
- `app/api/projects/[id]/versions/[versionId]/restore/route.ts` — 신규
- `app/api/projects/[id]/versions/compare/route.ts` — 신규
- `app/projects/[id]/versions/page.tsx` — 신규
- `components/proposal/version-timeline.tsx` — 신규
- `lib/db/schema.ts` — proposal_versions 테이블 추가

## 의존성

- Task 013 (섹션 내용 생성) 완료 필요 (스냅샷 대상)
- Task 040 (검증 게이트) 완료 필요 (자동 버전 생성 트리거)

## 테스트

- [ ] 수동 버전 저장 시 스냅샷이 올바르게 생성되는지 확인
- [ ] 자동 버전 생성 트리거가 정상 작동하는지 확인
- [ ] 버전 목록이 시간순으로 정렬되는지 확인
- [ ] 두 버전 비교 시 diff가 올바르게 표시되는지 확인
- [ ] 이전 버전 복원 시 현재 상태가 해당 버전으로 변경되는지 확인
- [ ] 복원 전 자동 백업 버전이 생성되는지 확인
- [ ] 버전 라벨이 올바르게 저장/표시되는지 확인
- [ ] npx tsc --noEmit 통과
- [ ] npm run build 통과
