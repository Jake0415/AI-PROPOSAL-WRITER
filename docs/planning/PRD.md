# AIPROWRITER - PRD (Product Requirements Document)

**문서 버전**: v1.0
**작성일**: 2026-03-17
**상태**: 승인됨

---

## 1. 제품 비전 및 목표

### 1.1 제품 비전

RFP(제안요청서)를 업로드하면 AI가 분석부터 전략 수립, 목차 구성, 내용 생성, 최종 산출물(Word/PPT) 출력까지 전 과정을 자동화하는 온프레미스 제안서 작성 솔루션.

### 1.2 핵심 목표

| 목표 | 측정 지표 | 목표치 |
| --- | --- | --- |
| 제안서 작성 시간 단축 | 기존 대비 소요 시간 | 70% 이상 단축 |
| 초안 완성도 | 사용자 수정 비율 | 80% 이상 완성도 |
| RFP 요구사항 반영률 | 추출 vs 최종 반영 | 95% 이상 |
| 공공입찰 형식 준수 | 평가 기준 커버리지 | 100% |

### 1.3 경쟁 우위

- **국내 공공입찰 특화**: 나라장터, 조달청 RFP 형식 최적화
- **온프레미스 배포**: 보안이 중요한 기업 환경에 적합
- **템플릿 기반 출력**: 기존 사내 양식 그대로 활용
- **한국어 최적화**: 공공 제안서 용어, 문체, 평가 기준 반영

---

## 2. 사용자 페르소나

### 페르소나 1: 제안 PM (주 사용자)

- **프로필**: 30대, IT 기업 제안팀
- **역할**: 공공 SI 프로젝트 제안서 총괄
- **고충**: 2주 내 200페이지 제안서 작성, 야근 상시화
- **목표**: AI 초안으로 작성 시간 단축, 전략/차별화에 집중

### 페르소나 2: 기술 아키텍트 (보조 사용자)

- **프로필**: 40대, 솔루션 아키텍트
- **역할**: 기술 부문 상세 검토 및 보완
- **목표**: 기술 아키텍처 다이어그램과 기능 설명 자동 생성

### 페르소나 3: 시스템 관리자

- **프로필**: IT 인프라팀
- **역할**: 온프레미스 시스템 설치, 운영, API 키 관리
- **목표**: 안정적 운영, 간편한 설치/업데이트

---

## 3. 핵심 워크플로우 (7단계)

```text
[1] RFP 업로드 & 파싱
 ↓
[2] AI 분석 (요구사항 + 평가기준 추출)
 ↓
[3] 방향성 설정 (AI가 3~5개 후보 제시 → 사용자 선택)
 ↓
[4] 전략 수립 (경쟁 전략 + 차별화 포인트)
 ↓
[5] 목차 구성 (공공 제안서 작성법 기반 자동 생성)
 ↓
[6] 내용 생성 (목차별 상세 내용 + 다이어그램)
 ↓
[7] 산출물 출력 (Word + PPT 자동 생성)
```

### 3.1 단계별 상세

#### 1단계: RFP 업로드 & 파싱

- PDF 또는 DOCX 형태의 RFP 파일 업로드
- 텍스트 추출 및 구조화
- 파싱 결과 미리보기 제공

#### 2단계: AI 분석

- 사업 개요, 범위, 요구사항, 평가 기준 자동 추출
- 구조화된 분석 결과를 카드/테이블 형태로 표시
- 사용자가 추출 결과를 검토하고 수정 가능
- 평가 배점표 자동 인식 및 가중치 분석

#### 3단계: 방향성 설정

- AI가 3~5개의 제안 방향성 후보 생성
- 각 방향성에 대한 장단점, 적합도 점수 제시
- 사용자가 선택 또는 조합하여 최종 방향 확정

#### 4단계: 전략 수립

- 선택된 방향성 기반 경쟁 전략 수립
- 차별화 포인트 3~5개 자동 도출
- 핵심 메시지(Key Message) 생성

#### 5단계: 목차 구성

- 공공 제안서 표준 구조 기반 목차 자동 생성
- RFP 평가 기준에 맞춘 목차 최적화
- 드래그앤드롭으로 목차 순서 변경 가능

#### 6단계: 내용 생성

- 각 목차 항목별로 AI가 상세 내용 생성
- 기술 부분: 기능 설명 + 예시 화면 + 개념도(Mermaid)
- 섹션별 생성 진행률 표시
- 생성된 내용 실시간 편집 가능

#### 7단계: 산출물 출력

- 사용자 템플릿 업로드 시 해당 양식에 맞춰 자동 채움
- 기본 제공 템플릿도 사용 가능
- Word 문서: 전체 제안서 (본문 + 표 + 다이어그램)
- PPT 장표: 발표용 요약본 (핵심 내용 + 시각 자료)

---

## 4. 기능 요구사항

### P0 (MVP 필수)

| ID | 기능 | 설명 |
| --- | --- | --- |
| F-001 | RFP 파일 업로드 | PDF/DOCX 파일 업로드 및 텍스트 추출 |
| F-002 | RFP 분석 | AI가 요구사항, 평가기준, 사업범위 추출 |
| F-003 | 분석 결과 표시 | 추출된 정보를 구조화된 UI로 표시 |
| F-004 | 방향성 제시 | AI가 3~5개 제안 방향 후보 생성 |
| F-005 | 방향성 선택 | 사용자가 방향을 선택/확정 |
| F-006 | 전략 생성 | 경쟁 전략, 차별화 포인트 자동 도출 |
| F-007 | 목차 자동 구성 | 공공 제안서 표준 기반 목차 생성 |
| F-008 | 목차 편집 | 목차 항목 추가/삭제/순서 변경 |
| F-009 | 섹션별 내용 생성 | 각 목차 항목에 대한 상세 내용 AI 생성 |
| F-010 | 내용 편집 | 생성된 내용 실시간 수정 |
| F-011 | Word 출력 | 완성된 제안서를 .docx 파일로 다운로드 |
| F-012 | PPT 출력 | 발표용 요약 장표를 .pptx 파일로 다운로드 |
| F-013 | 프로젝트 관리 | 프로젝트 생성/목록/삭제, 진행 상태 관리 |

### P1 (2차 릴리스)

| ID | 기능 | 설명 |
| --- | --- | --- |
| F-101 | 사용자 템플릿 업로드 | Word/PPT 커스텀 템플릿 업로드 및 관리 |
| F-102 | 템플릿 기반 출력 | 업로드된 템플릿 양식에 맞춰 내용 채움 |
| F-103 | 다이어그램 생성 | Mermaid 기반 아키텍처/개념도 자동 생성 |
| F-104 | 섹션 재생성 | 특정 섹션만 프롬프트 조정하여 재생성 |
| F-105 | 산출물 미리보기 | 다운로드 전 Word/PPT 미리보기 |
| F-106 | 제안서 이력 관리 | 버전별 변경 이력 추적 |
| F-107 | 관리자 설정 | API 키, 기본 템플릿, 시스템 설정 관리 |

### P2 (향후 확장)

| ID | 기능 | 설명 |
| --- | --- | --- |
| F-201 | HWP 지원 | 한글(HWP/HWPX) 파일 입출력 |
| F-202 | 과거 제안서 학습 | 기존 성공 제안서 업로드 → 스타일 학습 |
| F-203 | 멀티 사용자 | 동시 접속, 역할 기반 접근 제어 |
| F-204 | 협업 편집 | 실시간 공동 편집 |
| F-205 | 평가 시뮬레이션 | AI가 평가위원 관점에서 점수 예측 |
| F-206 | 나라장터 연동 | 공고 자동 수집 및 RFP 자동 다운로드 |

---

## 5. 비기능 요구사항

### 5.1 성능

| 항목 | 요구사항 |
| --- | --- |
| RFP 파싱 | 100페이지 PDF 기준 30초 이내 |
| RFP 분석 | 분석 완료까지 2분 이내 |
| 섹션 내용 생성 | 섹션당 30초 이내 |
| 전체 제안서 생성 | 20개 섹션 기준 15분 이내 |
| Word/PPT 출력 | 200페이지 기준 60초 이내 |
| 동시 프로젝트 | 최소 3개 프로젝트 동시 처리 |

### 5.2 보안

| 항목 | 요구사항 |
| --- | --- |
| 데이터 저장 | 모든 데이터 로컬 서버에만 저장 |
| API 통신 | Claude API 호출 시 TLS 1.3 암호화 |
| 파일 접근 | 업로드 파일 서버 로컬에만 저장, 외부 접근 차단 |
| 인증 | 단일 사용자: 기본 인증(PIN/패스워드) |
| API 키 관리 | 환경변수 기반, UI에 노출 금지 |
| 감사 로그 | 주요 작업 로그 기록 |

### 5.3 운영

| 항목 | 요구사항 |
| --- | --- |
| 설치 | Docker Compose 기반 원커맨드 설치 |
| 업데이트 | 이미지 교체 방식 무중단 업데이트 |
| 백업 | 프로젝트 데이터 자동 백업 (일 1회) |
| 모니터링 | 헬스체크 엔드포인트 제공 |

---

## 6. 데이터 모델

### 6.1 핵심 엔티티

```typescript
// Project (프로젝트)
interface Project {
  id: string;            // UUID
  title: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

type ProjectStatus =
  | 'uploaded'
  | 'analyzing'
  | 'direction_set'
  | 'strategy_set'
  | 'outline_ready'
  | 'generating'
  | 'completed';

// RfpFile (RFP 원본 파일)
interface RfpFile {
  id: string;
  projectId: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
  filePath: string;
  fileSize: number;
  rawText: string;
  uploadedAt: Date;
}

// RfpAnalysis (RFP 분석 결과)
interface RfpAnalysis {
  id: string;
  projectId: string;
  overview: Record<string, unknown>;
  requirements: Requirement[];
  evaluationCriteria: EvaluationCriterion[];
  scope: Record<string, unknown>;
  constraints: Record<string, unknown>;
  keywords: string[];
  analyzedAt: Date;
}

// ProposalDirection (제안 방향성)
interface ProposalDirection {
  id: string;
  projectId: string;
  candidates: DirectionCandidate[];
  selectedIndex: number;
  customNotes: string;
  confirmedAt: Date;
}

// ProposalStrategy (제안 전략)
interface ProposalStrategy {
  id: string;
  projectId: string;
  competitiveStrategy: string;
  differentiators: Differentiator[];
  keyMessages: string[];
  confirmedAt: Date;
}

// ProposalOutline (목차)
interface ProposalOutline {
  id: string;
  projectId: string;
  sections: OutlineSection[];
}

// ProposalSection (섹션 내용)
interface ProposalSection {
  id: string;
  projectId: string;
  outlineId: string;
  sectionPath: string;   // "1.2.3" 형태
  title: string;
  content: string;       // 마크다운 본문
  diagrams: string[];    // Mermaid 코드 배열
  status: 'pending' | 'generating' | 'generated' | 'edited';
  generatedAt: Date;
  editedAt: Date;
}

// Template (템플릿)
interface Template {
  id: string;
  name: string;
  type: 'word' | 'ppt';
  filePath: string;
  isDefault: boolean;
  uploadedAt: Date;
}

// OutputFile (산출물)
interface OutputFile {
  id: string;
  projectId: string;
  type: 'word' | 'ppt';
  templateId: string | null;
  filePath: string;
  fileName: string;
  generatedAt: Date;
  version: number;
}
```

### 6.2 저장소 전략

- **메타데이터**: SQLite (경량, 설치 불필요, 파일 기반)
- **파일 저장**: 로컬 파일시스템 (`data/uploads/`, `data/outputs/`, `data/templates/`)
- **ORM**: Drizzle ORM (TypeScript 친화적, SQLite 지원)

---

## 7. API 설계

### 7.1 RESTful API (Next.js Route Handlers)

#### 프로젝트 관리

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | /api/projects | 프로젝트 생성 |
| GET | /api/projects | 프로젝트 목록 |
| GET | /api/projects/:id | 프로젝트 상세 |
| DELETE | /api/projects/:id | 프로젝트 삭제 |

#### RFP 업로드 & 분석

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | /api/projects/:id/rfp/upload | RFP 파일 업로드 + 파싱 |
| GET | /api/projects/:id/rfp/raw-text | 추출된 원문 확인 |
| POST | /api/projects/:id/rfp/analyze | AI 분석 실행 (SSE) |
| GET | /api/projects/:id/rfp/analysis | 분석 결과 조회 |
| PUT | /api/projects/:id/rfp/analysis | 분석 결과 수정 |

#### 방향성 & 전략

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | /api/projects/:id/direction/generate | 방향성 후보 생성 (SSE) |
| GET | /api/projects/:id/direction | 방향성 후보 조회 |
| PUT | /api/projects/:id/direction/select | 방향성 선택 확정 |
| POST | /api/projects/:id/strategy/generate | 전략 생성 (SSE) |
| GET | /api/projects/:id/strategy | 전략 조회 |
| PUT | /api/projects/:id/strategy | 전략 수정/확정 |

#### 목차 & 내용

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | /api/projects/:id/outline/generate | 목차 자동 생성 (SSE) |
| GET | /api/projects/:id/outline | 목차 조회 |
| PUT | /api/projects/:id/outline | 목차 수정 |
| POST | /api/projects/:id/sections/generate | 전체 섹션 내용 생성 (SSE) |
| POST | /api/projects/:id/sections/:sectionId/generate | 개별 섹션 재생성 |
| GET | /api/projects/:id/sections | 전체 섹션 조회 |
| PUT | /api/projects/:id/sections/:sectionId | 섹션 내용 수정 |

#### 산출물 출력

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | /api/projects/:id/output/word | Word 생성 |
| POST | /api/projects/:id/output/ppt | PPT 생성 |
| GET | /api/projects/:id/output/:outputId/download | 파일 다운로드 |
| GET | /api/projects/:id/outputs | 산출물 목록 |

#### 시스템

| Method | Endpoint | 설명 |
| --- | --- | --- |
| GET | /api/health | 헬스체크 |
| POST | /api/templates/upload | 템플릿 업로드 |
| GET | /api/templates | 템플릿 목록 |

### 7.2 AI 스트리밍 패턴

AI 생성 작업은 Server-Sent Events(SSE) 방식으로 스트리밍:

```typescript
interface SSEEvent {
  type: 'progress' | 'chunk' | 'complete' | 'error';
  data: {
    step?: string;
    progress?: number;
    content?: string;
    result?: unknown;
    error?: { code: string; message: string };
  };
}
```

---

## 8. UI/UX 화면 구성

### 8.1 화면 목록

| 화면 | 경로 | 설명 |
| --- | --- | --- |
| 대시보드 | / | 프로젝트 목록, 새 프로젝트 생성 |
| RFP 업로드 | /projects/[id]/upload | 파일 드래그앤드롭 업로드 |
| RFP 분석 결과 | /projects/[id]/analysis | 분석 결과 카드/테이블 |
| 방향성 설정 | /projects/[id]/direction | 방향 후보 카드 비교/선택 |
| 전략 설정 | /projects/[id]/strategy | 전략/차별화 포인트 확인/수정 |
| 목차 편집 | /projects/[id]/outline | 트리 뷰 목차 편집 |
| 내용 편집 | /projects/[id]/sections | 섹션별 내용 편집기 |
| 산출물 출력 | /projects/[id]/output | 템플릿 선택, 생성, 다운로드 |
| 템플릿 관리 | /templates | 템플릿 업로드/목록/삭제 |
| 설정 | /settings | API 키, 시스템 설정 |

### 8.2 공통 레이아웃

```text
+---------------------------------------------+
| AIPROWRITER 로고       [설정] [테마 토글]     |  <- Navbar
+------+--------------------------------------+
|      |                                      |
| 단계 |        메인 콘텐츠 영역                 |
| 네비 |                                      |
| 게이션|                                      |
| (7단계)|                                    |
|      |                                      |
+------+--------------------------------------+
| Footer                                      |
+---------------------------------------------+
```

### 8.3 핵심 UI 컴포넌트

- **StepNavigation**: 프로젝트 내 7단계 진행 표시 (좌측 사이드바)
- **FileUploader**: 드래그앤드롭 파일 업로드 영역
- **AnalysisCard**: 분석 결과 항목 카드
- **DirectionSelector**: 방향성 후보 비교 카드
- **OutlineTree**: 드래그앤드롭 가능한 트리 뷰 목차 편집기
- **SectionEditor**: 마크다운 기반 섹션 내용 편집기
- **MermaidPreview**: Mermaid 다이어그램 실시간 렌더링
- **ProgressTracker**: AI 생성 진행률 표시 바

---

## 9. 기술 아키텍처

### 9.1 시스템 아키텍처

```text
+---------------------------------------------------+
|              클라이언트 (브라우저)                     |
|  Next.js App Router (React 19 Server Components)   |
+------------------------+--------------------------+
                         |
+------------------------+--------------------------+
|               Next.js API Routes                   |
|  +----------+ +----------+ +-------------------+  |
|  | 프로젝트  | | RFP 분석  | | 제안서 생성 엔진   |  |
|  | 관리 API  | |   API    | |     API           |  |
|  +----------+ +----------+ +-------------------+  |
+-----------------------+----------------------------+
|                서비스 레이어                          |
|  +----------+ +----------+ +-------------------+  |
|  | RFP      | | AI       | | Document          |  |
|  | Parser   | | Engine   | | Renderer          |  |
|  | Service  | | Service  | | Service           |  |
|  +----------+ +----------+ +-------------------+  |
+-----------------------+----------------------------+
|                인프라 레이어                          |
|  +----------+ +----------+ +-------------------+  |
|  | SQLite   | | File     | | Claude API        |  |
|  | (Drizzle)| | Storage  | | (@anthropic-ai)   |  |
|  +----------+ +----------+ +-------------------+  |
+---------------------------------------------------+
```

### 9.2 기술 스택

| 영역 | 기술 | 근거 |
| --- | --- | --- |
| 프레임워크 | Next.js 15 (App Router) | 기존 코드베이스 |
| UI | React 19 + shadcn/ui + TailwindCSS v4 | 기존 코드베이스 |
| 언어 | TypeScript 5 (strict) | 기존 코드베이스 |
| DB | SQLite + Drizzle ORM | 온프레미스, 설치 간편 |
| AI | Claude API (@anthropic-ai/sdk) | 한국어 성능 우수 |
| PDF 파싱 | pdf-parse | 경량, Node.js 네이티브 |
| DOCX 파싱 | mammoth | DOCX→텍스트 변환 최적 |
| Word 생성 | docx + docxtemplater | 프로그래밍 + 템플릿 |
| PPT 생성 | pptxgenjs | 제로 의존성, 완전 제어 |
| 다이어그램 | mermaid | SVG, AI 생성 용이 |
| 검증 | zod | 입력 검증 |
| 테스트 | Vitest + Playwright | CLAUDE.md 준수 |

### 9.3 디렉토리 구조

```text
app/
├── (dashboard)/page.tsx              # 대시보드
├── projects/[id]/
│   ├── layout.tsx                    # StepNavigation 사이드바
│   ├── upload/page.tsx               # 1. RFP 업로드
│   ├── analysis/page.tsx             # 2. 분석 결과
│   ├── direction/page.tsx            # 3. 방향성 설정
│   ├── strategy/page.tsx             # 4. 전략 수립
│   ├── outline/page.tsx              # 5. 목차 편집
│   ├── sections/page.tsx             # 6. 내용 편집
│   └── output/page.tsx               # 7. 산출물 출력
├── templates/page.tsx                # 템플릿 관리
├── settings/page.tsx                 # 설정
├── api/
│   ├── projects/[...slug]/route.ts
│   ├── templates/route.ts
│   ├── settings/route.ts
│   └── health/route.ts
├── layout.tsx
└── globals.css

components/
├── layout/                           # 기존 유지 (navbar, footer, theme-toggle)
├── providers/                        # 기존 유지 (theme-provider)
├── ui/                               # shadcn/ui 컴포넌트
├── project/                          # 프로젝트 컴포넌트
│   ├── step-navigation.tsx
│   ├── project-card.tsx
│   └── progress-tracker.tsx
├── rfp/                              # RFP 컴포넌트
│   ├── file-uploader.tsx
│   ├── analysis-card.tsx
│   └── analysis-editor.tsx
├── proposal/                         # 제안서 컴포넌트
│   ├── direction-selector.tsx
│   ├── strategy-editor.tsx
│   ├── outline-tree.tsx
│   ├── section-editor.tsx
│   └── mermaid-preview.tsx
└── output/                           # 산출물 컴포넌트
    ├── output-preview.tsx
    └── template-selector.tsx

lib/
├── utils.ts                          # 기존 유지
├── db/
│   ├── schema.ts                     # Drizzle 스키마
│   ├── client.ts                     # DB 연결
│   └── migrations/
├── services/
│   ├── rfp-parser.service.ts
│   ├── ai-engine.service.ts
│   ├── analysis.service.ts
│   ├── direction.service.ts
│   ├── strategy.service.ts
│   ├── outline.service.ts
│   ├── section-generator.service.ts
│   ├── word-renderer.service.ts
│   └── ppt-renderer.service.ts
├── ai/
│   ├── client.ts
│   ├── prompts/
│   │   ├── rfp-analysis.ts
│   │   ├── direction-generation.ts
│   │   ├── strategy-generation.ts
│   │   ├── outline-generation.ts
│   │   ├── section-generation.ts
│   │   └── diagram-generation.ts
│   └── types.ts
├── repositories/
│   ├── project.repository.ts
│   ├── rfp.repository.ts
│   ├── proposal.repository.ts
│   └── template.repository.ts
└── validators/
    ├── project.schema.ts
    ├── rfp.schema.ts
    └── proposal.schema.ts

data/                                 # gitignore 대상
├── uploads/
├── outputs/
├── templates/
└── db/
```

---

## 10. MVP 범위

### Phase 1: MVP (8주)

**포함**: F-001 ~ F-013 (P0 전체), 단일 사용자, 기본 Word/PPT 템플릿, SQLite, Docker Compose

**제외**: 사용자 템플릿, 다이어그램, HWP, 멀티 사용자

### Phase 2: 고도화 (4주)

F-101 ~ F-107, 기본 인증(PIN), 시스템 관리 화면

### Phase 3: 확장 (6주)

F-201 이후 선별 구현

---

## 11. 성공 지표 (KPI)

| KPI | 측정 방법 | 목표 |
| --- | --- | --- |
| 제안서 작성 시간 | RFP 업로드 → 최종 다운로드 | 기존 대비 70% 단축 |
| 초안 활용률 | 수정 없이 사용된 비율 | 60% 이상 |
| RFP 요구사항 커버리지 | 반영 요구사항 / 총 요구사항 | 95% 이상 |
| 프로젝트 완료율 | 완료 / 생성 프로젝트 | 80% 이상 |
| 시스템 가용성 | 월간 업타임 | 99% |

---

## 12. 제약사항 및 리스크

### 12.1 기술적 제약사항

| 제약 | 영향 | 대응 |
| --- | --- | --- |
| Claude API 토큰 제한 | 200페이지 전체를 한 번에 처리 불가 | 섹션 단위 분할 생성, 컨텍스트 요약 |
| Claude API 네트워크 의존 | 온프레미스이지만 AI 호출은 외부 필요 | 향후 로컬 LLM 폴백 |
| PDF 파싱 품질 | 스캔 PDF, 이미지 기반 PDF 파싱 불가 | 텍스트 기반 PDF만 지원, OCR은 P2 |
| 한글(HWP) 파싱 | 공공기관 HWP 비율 높음 | MVP 제외, Phase 3에서 검토 |

### 12.2 비즈니스 리스크

| 리스크 | 심각도 | 대응 |
| --- | --- | --- |
| AI 생성 품질 부족 | 높음 | 프롬프트 지속 개선, 피드백 루프 |
| 보안 우려 (기밀 RFP 외부 전송) | 높음 | API 호출 최소화, 로컬 LLM 로드맵 |
| Claude API 비용 증가 | 중간 | 토큰 모니터링, 캐싱, 효율적 프롬프트 |
| 공공 제안서 형식 변경 | 중간 | 템플릿/프롬프트 분리로 유연 대응 |
