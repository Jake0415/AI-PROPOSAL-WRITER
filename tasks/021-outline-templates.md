# Task 021: 레이아웃 템플릿 시스템

## 상태: 대기

## Phase: 3 - RFP 업로드 & 분석

## 목표

업종별 기본 목차 템플릿(SI/컨설팅/유지보수)을 제공하고, 사용자가 자주 사용하는 목차를 "내 템플릿"으로 저장하여 재사용할 수 있는 시스템 구현.

## 기본 템플릿 구조

### SI 프로젝트 (기술부문 강조)

```text
I. 제안 개요 (5%)
  1.1 사업 이해 / 1.2 추진 방향 / 1.3 기대 효과
II. 제안업체 일반 (10%)
  2.1 회사 현황 / 2.2 유사 수행 실적 / 2.3 참여 인력
III. 기술 부문 (45%)
  3.1 현황 분석 / 3.2 목표 시스템 설계
  3.3 아키텍처 구성 / 3.4 기능 설계
  3.5 데이터 설계 / 3.6 인터페이스 설계
  3.7 시험 및 검증 / 3.8 이행 및 전환
IV. 관리 부문 (20%)
  4.1 수행 조직 / 4.2 일정 관리 / 4.3 품질 보증
  4.4 위험 관리 / 4.5 보안 관리
V. 지원 부문 (10%)
  5.1 교육 훈련 / 5.2 유지보수 / 5.3 기술 이전
```

### 컨설팅 (방법론 강조)

```text
I. 제안 개요 / II. 제안업체 일반
III. 컨설팅 방법론 (50%)
  3.1 접근 전략 / 3.2 분석 프레임워크
  3.3 현황 진단 / 3.4 벤치마킹
  3.5 To-Be 모델 / 3.6 실행 로드맵
IV. 관리 부문 / V. 지원 부문
```

### 유지보수 (SLA/운영 강조)

```text
I. 제안 개요 / II. 제안업체 일반
III. 운영 체계 (40%)
  3.1 운영 조직 / 3.2 장애 대응 체계
  3.3 SLA 관리 / 3.4 예방적 유지보수
  3.5 성능 모니터링
IV. 관리 부문 / V. 지원 부문
```

## 구현 사항

### Repository + 시드 데이터

- [ ] `outlineTemplate.repository.ts` 신규 (findAll, findById, findByCategory, create, update, delete)
- [ ] `data/seed/outline-templates.json` — 3개 기본 템플릿 시드 데이터
  - 각 템플릿에 OutlineSection[] (meta 포함) JSON 작성
  - isDefault: true, isUserTemplate: false
- [ ] DB 초기화 시 isDefault 템플릿 자동 삽입 로직

### API

- [ ] GET /api/outline-templates — 템플릿 목록 (query: ?category=si)
- [ ] GET /api/outline-templates/[id] — 템플릿 상세
- [ ] POST /api/outline-templates — 사용자 템플릿 저장
- [ ] PUT /api/outline-templates/[id] — 템플릿 수정 (사용자 템플릿만)
- [ ] DELETE /api/outline-templates/[id] — 템플릿 삭제 (사용자 템플릿만)
- [ ] POST /api/projects/[id]/outline/from-template — 템플릿 기반 목차 적용

### UI 컴포넌트

- [ ] `OutlineTemplateSelector` (components/proposal/outline-template-selector.tsx)
  - Dialog 모달
  - 카테고리 탭 (SI / 컨설팅 / 유지보수 / 내 템플릿)
  - 각 템플릿의 트리 미리보기
  - "적용" 버튼 → 현재 목차 교체 (AlertDialog로 확인)
- [ ] OutlineToolbar에 "템플릿 선택", "내 템플릿으로 저장" 버튼 연결

### Zod 검증

- [ ] `createOutlineTemplateSchema` (lib/validators/outline.schema.ts에 추가)

## 관련 파일

- `lib/repositories/outline-template.repository.ts` (신규)
- `data/seed/outline-templates.json` (신규)
- `app/api/outline-templates/route.ts` (신규)
- `app/api/outline-templates/[id]/route.ts` (신규)
- `app/api/projects/[id]/outline/from-template/route.ts` (신규)
- `components/proposal/outline-template-selector.tsx` (신규)
- `components/proposal/outline-toolbar.tsx` (수정)
- `lib/db/client.ts` (시드 삽입 로직)
- `lib/validators/outline.schema.ts` (확장)

## 의존성

- Task 012 확장 완료 필요

## 테스트 체크리스트

- [ ] 기본 템플릿 3개 목록 표시
- [ ] 템플릿 선택 → 목차에 적용 → 트리 표시
- [ ] "내 템플릿으로 저장" → 목록에 추가
- [ ] 사용자 템플릿 삭제 동작
- [ ] 기본 템플릿은 삭제 불가 확인
- [ ] 카테고리 필터 동작
