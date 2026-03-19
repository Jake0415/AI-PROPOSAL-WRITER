# AIPROWRITER - PRD (Product Requirements Document)

**문서 버전**: v2.0
**작성일**: 2026-03-18
**상태**: 승인됨
**변경 이력**: v1.0(2026-03-17) → v2.0(2026-03-18) 수주 최적화 시나리오 12건 반영

---

## 1. 제품 비전 및 목표

### 1.1 제품 비전

RFP(제안요청서)를 업로드하면 AI가 **수주 최적화 관점의 7단계 분석**, 전략 수립, 목차 구성, 내용 생성, **자동 검증**, **가격 제안서**, 최종 산출물(Word/PPT) 출력까지 전 과정을 자동화하는 **멀티 LLM 기반** 제안서 작성 솔루션.

### 1.2 핵심 목표

| 목표 | 측정 지표 | 목표치 |
| --- | --- | --- |
| 제안서 작성 시간 단축 | 기존 대비 소요 시간 | 70% 이상 단축 |
| 초안 완성도 | 사용자 수정 비율 | 80% 이상 완성도 |
| RFP 요구사항 반영률 | 추출 vs 최종 반영 | 95% 이상 |
| 공공입찰 형식 준수 | 평가 기준 커버리지 | 100% |
| 요구사항 추적성 | REQ-ID 매핑 커버리지 | 100% |
| 검증 리포트 자동화 | 수동 검증 대비 시간 | 80% 이상 단축 |

### 1.3 경쟁 우위

- **국내 공공입찰 특화**: 나라장터, 조달청 RFP 형식 최적화
- **수주 최적화 분석**: EVAL-ID / REQ-ID 7개 카테고리 기반 추적성 매트릭스
- **멀티 LLM**: GPT + Claude 선택/병행 사용으로 최적 결과 도출
- **자동 검증 리포트**: AI가 평가위원 관점에서 제안서 품질을 사전 검증
- **온프레미스/클라우드 하이브리드**: Supabase 기반 유연한 배포
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
- **역할**: 시스템 설치, 운영, API 키 관리, 사용자/권한 관리
- **목표**: 안정적 운영, 간편한 설치/업데이트, AI 사용량 추적

---

## 3. 핵심 워크플로우 (10단계)

```text
[1] RFP 업로드 & 파싱
 ↓
[2] AI 수주 최적화 분석 (7단계: EVAL-ID + REQ-ID 7개 카테고리 + 추적성 매트릭스)
 ↓
[3] 방향성 설정 (AI가 3~5개 후보 제시 → 경쟁 분석/SWOT 근거 → 사용자 선택)
 ↓
[4] 전략 수립 (경쟁 전략 + 차별화 포인트)
 ↓  ← 검증 게이트 ①
[5] 목차 구성 (공공 제안서 작성법 기반 자동 생성 + 평가항목 히트맵)
 ↓
[6] 내용 생성 (목차별 상세 내용 + 다이어그램 + REQ-ID 추적 패널)
 ↓  ← 검증 게이트 ②
[7] 제안서 자동 검증 리포트 (예상 점수 + 충족도 + 개선사항)
 ↓
[8] 가격 제안서 생성 (산출내역서 + 인건비 산정 + 경비 내역)
 ↓  ← 검증 게이트 ③
[9] 산출물 출력 (Word + PPT 자동 생성)
 ↓
[10] 버전 관리 & 비교 (변경 이력 추적 + 버전간 diff)
```

### 3.1 단계별 상세

#### 1단계: RFP 업로드 & 파싱

- PDF 또는 DOCX 형태의 RFP 파일 업로드
- 텍스트 추출 및 구조화
- 파싱 결과 미리보기 제공

#### 2단계: AI 수주 최적화 분석 (7단계 분석)

- **7단계 분석 프로세스**:
  1. 사업 개요 파악
  2. 평가 기준 추출 (EVAL-ID 자동 부여)
  3. 요구사항 추출 (REQ-ID 7개 카테고리 분류)
  4. 기술 요건 분석
  5. 제약 조건 식별
  6. 핵심 키워드 추출
  7. 추적성 매트릭스 생성 (EVAL-ID ↔ REQ-ID 매핑)
- **REQ-ID 7개 카테고리**: 기능요구사항, 성능요구사항, 보안요구사항, 데이터요구사항, 인터페이스요구사항, 품질요구사항, 제약사항
- **단계별 실시간 진행 표시**:
  - 분석 시작 시 10개 세부 단계가 수직 스테퍼(Stepper) UI로 표시
  - 각 단계는 LLM 스트리밍 출력의 JSON 키 감지(`generateStream` + Key Detection)로 실시간 전환 (pending → active → complete)
  - 진행률 바와 현재 단계명 동시 표시
  - 10개 단계: 사업 개요 파악 → 평가항목 추출 → 요구사항 도출 → 추적성 매트릭스 → 자격요건 추출 → 배점 전략 분석 → 목차 구성 제안 → 범위 정의 → 제약사항 추출 → 키워드 추출
- 구조화된 분석 결과를 **6개 탭** (사업개요, 요구사항, 평가기준, 추적성 매트릭스, 키워드, 원문)으로 표시
- 사용자가 추출 결과를 검토하고 수정 가능

#### 3단계: 방향성 설정

- AI가 3~5개의 제안 방향성 후보 생성
- 각 방향성에 대한 장단점, 적합도 점수 제시
- **경쟁 분석 + SWOT**: service-analyst 에이전트가 방향성 선택 근거 제공
- 사용자가 선택 또는 조합하여 최종 방향 확정

#### 4단계: 전략 수립

- 선택된 방향성 기반 경쟁 전략 수립
- 차별화 포인트 3~5개 자동 도출
- 핵심 메시지(Key Message) 생성
- **검증 게이트 ①**: 전략과 RFP 평가기준 정합성 자동 확인

#### 5단계: 목차 구성

- 공공 제안서 표준 구조 기반 목차 자동 생성
- RFP 평가 기준에 맞춘 목차 최적화
- **목차-평가항목 히트맵**: 매핑 상태 시각화 (미매핑 항목 즉시 식별)
- 드래그앤드롭으로 목차 순서 변경 가능

#### 6단계: 내용 생성

- 각 목차 항목별로 AI가 상세 내용 생성
- 기술 부분: 기능 설명 + 예시 화면 + 개념도(Mermaid)
- **REQ-ID 추적 패널**: 섹션별 요구사항 커버리지 실시간 표시
- 섹션별 생성 진행률 표시
- 생성된 내용 실시간 편집 가능
- **검증 게이트 ②**: 섹션 완료 시 REQ-ID 커버리지 자동 체크

#### 7단계: 제안서 자동 검증 리포트

- **proposal-reviewer 에이전트** 기반 자동 검증
- 평가위원 관점에서 예상 점수 산출
- 평가항목별 충족도 분석
- 구체적 개선사항 제시 (약점 섹션 하이라이트)
- 검증 통과 시 다음 단계 진행 가능

#### 8단계: 가격 제안서 생성

- **price-proposal 에이전트** 기반 자동 생성
- 산출내역서 (SW 개발비, HW/SW 도입비, 유지보수비)
- 인건비 산정 (투입인력 등급별 단가 × 공수)
- 경비 내역 (여비, 재료비, 기타 경비)
- RFP 예산 범위 내 최적화

#### 9단계: 산출물 출력

- 사용자 템플릿 업로드 시 해당 양식에 맞춰 자동 채움
- 기본 제공 템플릿도 사용 가능
- Word 문서: 전체 제안서 (본문 + 표 + 다이어그램)
- PPT 장표: 발표용 요약본 (핵심 내용 + 시각 자료)
- **검증 게이트 ③**: 최종 산출물 포맷/누락 항목 체크

#### 10단계: 버전 관리 & 비교

- 제안서 버전별 스냅샷 자동 저장
- 버전 간 diff 비교 (변경 부분 하이라이트)
- 이전 버전 복원 기능
- 변경 이력 타임라인

---

## 4. 기능 요구사항

### P0 (MVP 필수)

| ID | 기능 | 설명 | 상태 |
| --- | --- | --- | --- |
| F-001 | RFP 파일 업로드 | PDF/DOCX 파일 업로드 및 텍스트 추출 | ✅ 구현됨 |
| F-002 | RFP 수주 최적화 분석 | 7단계 분석, EVAL-ID, REQ-ID 7개 카테고리, 추적성 매트릭스 | ✅ 구현됨 |
| F-003 | 분석 결과 표시 | 6개 탭 UI (사업개요/요구사항/평가기준/추적성/키워드/원문) | ✅ 구현됨 |
| F-004 | 방향성 제시 | AI가 3~5개 제안 방향 후보 생성 | |
| F-005 | 방향성 선택 | 사용자가 방향을 선택/확정 | |
| F-006 | 전략 생성 | 경쟁 전략, 차별화 포인트 자동 도출 | |
| F-007 | 목차 자동 구성 | 공공 제안서 표준 기반 목차 생성 | |
| F-008 | 목차 편집 | 목차 항목 추가/삭제/순서 변경 | |
| F-009 | 섹션별 내용 생성 | 각 목차 항목에 대한 상세 내용 AI 생성 | |
| F-010 | 내용 편집 | 생성된 내용 실시간 수정 | |
| F-011 | Word 출력 | 완성된 제안서를 .docx 파일로 다운로드 | |
| F-012 | PPT 출력 | 발표용 요약 장표를 .pptx 파일로 다운로드 | |
| F-013 | 프로젝트 관리 | 프로젝트 생성/목록/삭제, 진행 상태 관리 | ✅ 구현됨 |
| F-014 | 멀티 LLM 지원 | GPT + Claude 선택/전환 지원 | ✅ 구현됨 |
| F-015 | Supabase Auth 인증 | 이메일/비밀번호 + 소셜 로그인 + 세션 관리 | ✅ 구현됨 |
| F-016 | 제안서 작성 가이드 | 팁 패널 + 가이드 페이지 + AI 코칭 | ✅ 구현됨 |
| F-017 | 제안서 자동 검증 리포트 | proposal-reviewer 에이전트, 예상 점수, 충족도, 개선사항 | |
| F-018 | 섹션 편집기 + 요구사항 추적 패널 | REQ-ID 커버리지 실시간 표시 | |
| F-019 | 단계별 검증 게이트 | 각 단계 완료 시 자동 품질 체크 | |

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
| F-108 | 가격 제안서 생성 | price-proposal 에이전트, 산출내역서, 인건비 산정 |
| F-109 | 경쟁 분석 + SWOT | service-analyst 에이전트, 방향성 선택 근거 |
| F-110 | 목차-평가항목 히트맵 | 매핑 상태 시각화, 미매핑 즉시 식별 |
| F-111 | 제안서 버전 관리 + 비교 | 스냅샷 저장, diff 비교, 이전 버전 복원 |

### P2 (향후 확장)

| ID | 기능 | 설명 |
| --- | --- | --- |
| F-201 | HWP 지원 | 한글(HWP/HWPX) 파일 입출력 |
| F-202 | 과거 제안서 학습 | 기존 성공 제안서 업로드 → 스타일 학습 |
| F-203 | 멀티 사용자 | 동시 접속, 역할 기반 접근 제어 |
| F-204 | 협업 편집 | 실시간 공동 편집 |
| F-205 | 평가 시뮬레이션 | AI가 평가위원 관점에서 점수 예측 |
| F-206 | 나라장터 연동 | 공고 자동 수집 및 RFP 자동 다운로드 |
| F-207 | 자사 역량 갭 분석 | RFP 요구사항 대비 자사 역량 부족분 식별 |
| F-208 | 협력사 관리 | 협력사 풀 관리, 역량 매칭, 참여 이력 |
| F-209 | 법규 컴플라이언스 체크리스트 | 관련 법규/인증 요건 자동 체크 |
| F-210 | 나라장터 공고 모니터링 | 키워드 기반 공고 알림, 자동 분류 |

---

## 5. 비기능 요구사항

### 5.1 성능

| 항목 | 요구사항 |
| --- | --- |
| RFP 파싱 | 100페이지 PDF 기준 30초 이내 |
| RFP 7단계 분석 | 분석 완료까지 3분 이내 |
| 섹션 내용 생성 | 섹션당 30초 이내 |
| 전체 제안서 생성 | 20개 섹션 기준 15분 이내 |
| Word/PPT 출력 | 200페이지 기준 60초 이내 |
| 검증 리포트 생성 | 전체 제안서 기준 2분 이내 |
| 가격 제안서 생성 | 산출내역서 포함 1분 이내 |
| 동시 프로젝트 | 최소 5개 프로젝트 동시 처리 |

### 5.2 보안

| 항목 | 요구사항 |
| --- | --- |
| 인증 | 커스텀 JWT 인증 (이메일/PW) |
| 데이터 저장 | Supabase PostgreSQL (RLS 적용) |
| API 통신 | LLM API 호출 시 TLS 1.3 암호화 |
| 파일 접근 | Supabase Storage RLS 기반 접근 제어 |
| API 키 관리 | 환경변수 기반, UI에 노출 금지 |
| 감사 로그 | 주요 작업 로그 기록 |
| RBAC | 역할 기반 접근 제어 (admin/pm/writer/viewer) |

### 5.3 운영

| 항목 | 요구사항 |
| --- | --- |
| 설치 | Docker Compose 기반 원커맨드 설치 |
| 업데이트 | 이미지 교체 방식 무중단 업데이트 |
| 백업 | 프로젝트 데이터 자동 백업 (일 1회) |
| 모니터링 | 헬스체크 엔드포인트 제공 |
| AI 사용량 | LLM별 토큰 사용량/비용 추적 |

---

## 6. 데이터 모델

### 6.1 핵심 엔티티

```typescript
// Project (프로젝트)
interface Project {
  id: string;            // UUID
  userId: string;        // Supabase Auth user ID
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
  | 'reviewing'        // v2.0 추가: 검증 단계
  | 'pricing'          // v2.0 추가: 가격 제안 단계
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

// RfpAnalysis (RFP 분석 결과) — v2.0 확장
interface RfpAnalysis {
  id: string;
  projectId: string;
  overview: Record<string, unknown>;
  requirements: StructuredRequirement[];  // v2.0: REQ-ID 포함
  evaluationCriteria: EvaluationItem[];   // v2.0: EVAL-ID 포함
  scope: Record<string, unknown>;
  constraints: Record<string, unknown>;
  keywords: string[];
  traceabilityMatrix: TraceabilityMapping[];  // v2.0 추가
  analyzedAt: Date;
}

// v2.0 신규: 평가항목 (EVAL-ID 기반)
interface EvaluationItem {
  evalId: string;          // "EVAL-001" 형태
  category: string;        // 대분류
  subcategory: string;     // 소분류
  description: string;     // 평가 내용
  maxScore: number;        // 배점
  weight: number;          // 가중치 (%)
}

// v2.0 신규: 구조화된 요구사항 (REQ-ID 7개 카테고리)
interface StructuredRequirement {
  reqId: string;           // "REQ-F-001" 형태
  category: RequirementCategory;
  title: string;
  description: string;
  priority: 'must' | 'should' | 'could';
  sourcePageRef: string;   // RFP 원문 페이지 참조
}

type RequirementCategory =
  | 'functional'           // 기능요구사항
  | 'performance'          // 성능요구사항
  | 'security'             // 보안요구사항
  | 'data'                 // 데이터요구사항
  | 'interface'            // 인터페이스요구사항
  | 'quality'              // 품질요구사항
  | 'constraint';          // 제약사항

// v2.0 신규: 추적성 매트릭스
interface TraceabilityMapping {
  evalId: string;          // EVAL-ID
  reqIds: string[];        // 관련 REQ-ID 목록
  coverageStatus: 'full' | 'partial' | 'none';
  notes: string;
}

// ProposalDirection (제안 방향성)
interface ProposalDirection {
  id: string;
  projectId: string;
  candidates: DirectionCandidate[];
  selectedIndex: number;
  customNotes: string;
  competitiveAnalysis?: CompetitiveAnalysis;  // v2.0 추가
  confirmedAt: Date;
}

// v2.0 신규: 경쟁 분석
interface CompetitiveAnalysis {
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  competitors: CompetitorProfile[];
  recommendedStrategy: string;
}

interface CompetitorProfile {
  name: string;
  strengths: string[];
  weaknesses: string[];
  marketShare: string;
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
  heatmapData?: OutlineHeatmapEntry[];  // v2.0 추가
}

// v2.0 신규: 목차-평가항목 히트맵 엔트리
interface OutlineHeatmapEntry {
  sectionPath: string;     // 목차 경로
  evalIds: string[];       // 매핑된 EVAL-ID
  reqIds: string[];        // 매핑된 REQ-ID
  coverageScore: number;   // 0~100
}

// ProposalSection (섹션 내용)
interface ProposalSection {
  id: string;
  projectId: string;
  outlineId: string;
  sectionPath: string;     // "1.2.3" 형태
  title: string;
  content: string;         // 마크다운 본문
  diagrams: string[];      // Mermaid 코드 배열
  linkedReqIds: string[];  // v2.0 추가: 이 섹션이 커버하는 REQ-ID
  status: 'pending' | 'generating' | 'generated' | 'edited';
  generatedAt: Date;
  editedAt: Date;
}

// v2.0 신규: 검증 리포트
interface ReviewReport {
  id: string;
  projectId: string;
  overallScore: number;        // 예상 총점
  maxPossibleScore: number;    // 만점
  evaluationResults: EvalItemResult[];
  strengths: string[];
  weaknesses: string[];
  improvements: ReviewImprovement[];
  reviewedAt: Date;
}

interface EvalItemResult {
  evalId: string;
  predictedScore: number;
  maxScore: number;
  fulfillmentRate: number;     // 0~100%
  feedback: string;
}

interface ReviewImprovement {
  targetSection: string;       // 대상 섹션 경로
  evalId: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  suggestion: string;
}

// v2.0 신규: 가격 제안서
interface PriceProposal {
  id: string;
  projectId: string;
  totalAmount: number;
  breakdown: PriceBreakdown;
  generatedAt: Date;
}

interface PriceBreakdown {
  swDevelopment: CostItem[];     // SW 개발비
  hwSwPurchase: CostItem[];      // HW/SW 도입비
  maintenance: CostItem[];       // 유지보수비
  labor: LaborCostItem[];        // 인건비
  expenses: CostItem[];          // 경비 (여비, 재료비 등)
}

interface CostItem {
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  notes: string;
}

interface LaborCostItem {
  role: string;            // 투입 인력 등급
  grade: string;           // 기술사/특급/고급/중급/초급
  monthlyRate: number;     // 월 단가
  manMonths: number;       // 투입 공수 (M/M)
  amount: number;
}

// v2.0 신규: 검증 게이트
interface StageGate {
  id: string;
  projectId: string;
  stage: number;           // 게이트 번호 (1, 2, 3)
  checkItems: GateCheckItem[];
  passed: boolean;
  checkedAt: Date;
}

interface GateCheckItem {
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
}

// v2.0 신규: 제안서 버전
interface ProposalVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  label: string;           // "초안", "1차 수정", "최종본" 등
  snapshot: Record<string, unknown>;  // 전체 상태 스냅샷
  createdAt: Date;
  createdBy: string;
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
  type: 'word' | 'ppt' | 'price';  // v2.0: price 추가
  templateId: string | null;
  filePath: string;
  fileName: string;
  generatedAt: Date;
  version: number;
}
```

### 6.2 저장소 전략

- **메타데이터**: Supabase PostgreSQL (RLS 적용, 멀티유저 지원)
- **파일 저장**: Supabase Storage (RFP 원본, 템플릿, 산출물)
- **ORM**: Drizzle ORM (TypeScript 친화적, PostgreSQL 지원)
- **마이그레이션**: drizzle-kit 기반 스키마 마이그레이션

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
| POST | /api/projects/:id/rfp/analyze | AI 7단계 분석 실행 (SSE) |
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
| GET | /api/projects/:id/outline/heatmap | 목차-평가항목 히트맵 조회 |
| POST | /api/projects/:id/sections/generate | 전체 섹션 내용 생성 (SSE) |
| POST | /api/projects/:id/sections/:sectionId/generate | 개별 섹션 재생성 |
| GET | /api/projects/:id/sections | 전체 섹션 조회 |
| PUT | /api/projects/:id/sections/:sectionId | 섹션 내용 수정 |
| GET | /api/projects/:id/sections/:sectionId/tracking | 섹션별 REQ-ID 추적 |

#### 검증 & 가격 (v2.0 추가)

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | /api/projects/:id/review/generate | 검증 리포트 생성 (SSE) |
| GET | /api/projects/:id/review | 검증 리포트 조회 |
| POST | /api/projects/:id/price/generate | 가격 제안서 생성 (SSE) |
| GET | /api/projects/:id/price | 가격 제안서 조회 |
| PUT | /api/projects/:id/price | 가격 제안서 수정 |
| POST | /api/projects/:id/gate/:stageNum/check | 검증 게이트 실행 |
| GET | /api/projects/:id/gate/:stageNum | 검증 게이트 결과 조회 |

#### 버전 관리 (v2.0 추가)

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | /api/projects/:id/versions | 현재 상태 버전 저장 |
| GET | /api/projects/:id/versions | 버전 목록 조회 |
| GET | /api/projects/:id/versions/:versionId | 버전 상세 조회 |
| GET | /api/projects/:id/versions/compare | 두 버전 비교 (diff) |
| POST | /api/projects/:id/versions/:versionId/restore | 이전 버전 복원 |

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
| GET | /api/admin/usage | AI 사용량 조회 |

### 7.2 AI 스트리밍 패턴

AI 생성 작업은 Server-Sent Events(SSE) 방식으로 스트리밍:

```typescript
interface SSEEvent {
  type: 'progress' | 'chunk' | 'complete' | 'error';
  data: {
    step?: string;
    progress?: number;
    stepIndex?: number;       // 현재 단계 인덱스 (0-based)
    totalSteps?: number;      // 전체 단계 수
    steps?: string[];         // 전체 단계 라벨 목록 (최초 1회 전송)
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
| 로그인 | /login | Supabase Auth 이메일/PW + 소셜 로그인 |
| 대시보드 | / | 프로젝트 목록, 새 프로젝트 생성 |
| RFP 업로드 | /projects/[id]/upload | 파일 드래그앤드롭 업로드 |
| RFP 분석 결과 | /projects/[id]/analysis | **6개 탭**: 사업개요/요구사항/평가기준/추적성/키워드/원문 |
| 방향성 설정 | /projects/[id]/direction | 방향 후보 카드 비교/선택 + 경쟁 분석 패널 |
| 전략 설정 | /projects/[id]/strategy | 전략/차별화 포인트 확인/수정 |
| 목차 편집 | /projects/[id]/outline | 트리 뷰 목차 편집 + **히트맵 패널** |
| 내용 편집 | /projects/[id]/sections | 섹션별 내용 편집기 + **REQ-ID 추적 패널** |
| 검증 리포트 | /projects/[id]/review | 예상 점수, 충족도 차트, 개선사항 목록 |
| 가격 제안서 | /projects/[id]/pricing | 산출내역서, 인건비, 경비 편집 |
| 산출물 출력 | /projects/[id]/output | 템플릿 선택, 생성, 다운로드 |
| 버전 관리 | /projects/[id]/versions | 버전 목록, diff 비교, 복원 |
| 제안서 가이드 | /guide | 작성 팁, AI 코칭, 모범 사례 |
| 관리자 대시보드 | /admin | 사용자 관리, AI 사용량, 시스템 설정 |
| 템플릿 관리 | /templates | 템플릿 업로드/목록/삭제 |
| 설정 | /settings | API 키, LLM 선택, 시스템 설정 |

### 8.2 공통 레이아웃

```text
+---------------------------------------------+
| AIPROWRITER 로고   [가이드] [설정] [테마] [유저] |  <- Navbar
+------+--------------------------------------+
|      |                                      |
| 단계 |        메인 콘텐츠 영역                 |
| 네비 |                                      |
| 게이션|        + 보조 패널 (REQ-ID 추적 등)    |
|(10단계)|                                    |
|      |                                      |
+------+--------------------------------------+
| Footer                                      |
+---------------------------------------------+
```

### 8.3 핵심 UI 컴포넌트

- **StepNavigation**: 프로젝트 내 10단계 진행 표시 (좌측 사이드바)
- **FileUploader**: 드래그앤드롭 파일 업로드 영역
- **AnalysisCard**: 분석 결과 항목 카드
- **AnalysisTabs**: 6개 탭 분석 결과 뷰 (사업개요/요구사항/평가기준/추적성/키워드/원문)
- **DirectionSelector**: 방향성 후보 비교 카드
- **CompetitivePanel**: 경쟁 분석 + SWOT 패널
- **OutlineTree**: 드래그앤드롭 가능한 트리 뷰 목차 편집기
- **HeatmapPanel**: 목차-평가항목 매핑 히트맵
- **SectionEditor**: 마크다운 기반 섹션 내용 편집기
- **ReqTrackingPanel**: REQ-ID 커버리지 실시간 추적 패널
- **MermaidPreview**: Mermaid 다이어그램 실시간 렌더링
- **ReviewDashboard**: 검증 리포트 점수/충족도 대시보드
- **PriceEditor**: 가격 제안서 편집기 (산출내역서 테이블)
- **VersionTimeline**: 버전 관리 타임라인 + diff 뷰
- **ProgressTracker**: AI 생성 진행률 표시 바
- **AnalysisProgressStepper**: RFP 분석 10단계 수직 스테퍼 (JSON Key Detection 기반 실시간 상태 전환)
- **GateIndicator**: 검증 게이트 통과/실패 표시
- **TipPanel**: 제안서 작성 팁 + AI 코칭 패널
- **LlmSelector**: GPT/Claude 선택 드롭다운

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
|  +----------+ +----------+ +-------------------+  |
|  | 검증 리포트| | 가격 제안 | | 버전 관리          |  |
|  |   API    | |   API    | |    API            |  |
|  +----------+ +----------+ +-------------------+  |
+-----------------------+----------------------------+
|                서비스 레이어                          |
|  +----------+ +----------+ +-------------------+  |
|  | RFP      | | AI       | | Document          |  |
|  | Parser   | | Engine   | | Renderer          |  |
|  | Service  | | Service  | | Service           |  |
|  +----------+ +----------+ +-------------------+  |
|  +----------+ +----------+ +-------------------+  |
|  | Review   | | Price    | | Version           |  |
|  | Service  | | Service  | | Service           |  |
|  +----------+ +----------+ +-------------------+  |
+-----------------------+----------------------------+
|                인프라 레이어                          |
|  +----------+ +----------+ +-------------------+  |
|  | Supabase | | Supabase | | 멀티 LLM          |  |
|  | PostgreSQL| | Storage | | (Claude + GPT)    |  |
|  | (Drizzle)| |          | |                   |  |
|  +----------+ +----------+ +-------------------+  |
|  +----------+ +----------+                        |
|  | Supabase | | Stage    |                        |
|  | Auth     | | Gate     |                        |
|  +----------+ +----------+                        |
+---------------------------------------------------+
```

### 9.2 기술 스택

| 영역 | 기술 | 근거 |
| --- | --- | --- |
| 프레임워크 | Next.js 16 (App Router) | 최신 안정 버전, Turbopack |
| UI | React 19 + shadcn/ui + TailwindCSS v4 | 기존 코드베이스 |
| 언어 | TypeScript 5 (strict) | 기존 코드베이스 |
| DB | Supabase PostgreSQL + Drizzle ORM | 클라우드 관리형, RLS, 멀티유저 |
| 인증 | 커스텀 JWT (jose + bcryptjs) | 이메일/PW 인증 |
| 파일 저장 | Supabase Storage | RLS 기반 접근 제어 |
| AI (1) | Claude API (@anthropic-ai/sdk) | 한국어 성능 우수, 장문 분석 |
| AI (2) | OpenAI GPT API (openai) | 다양성, 사용자 선택 지원 |
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
├── login/page.tsx                    # 로그인 (Supabase Auth)
├── guide/page.tsx                    # 제안서 작성 가이드
├── admin/page.tsx                    # 관리자 대시보드
├── projects/[id]/
│   ├── layout.tsx                    # StepNavigation 사이드바 (10단계)
│   ├── upload/page.tsx               # 1. RFP 업로드
│   ├── analysis/page.tsx             # 2. RFP 7단계 분석 (6개 탭)
│   ├── direction/page.tsx            # 3. 방향성 설정 + 경쟁 분석
│   ├── strategy/page.tsx             # 4. 전략 수립
│   ├── outline/page.tsx              # 5. 목차 편집 + 히트맵
│   ├── sections/page.tsx             # 6. 내용 편집 + REQ-ID 추적
│   ├── review/page.tsx               # 7. 검증 리포트
│   ├── pricing/page.tsx              # 8. 가격 제안서
│   ├── output/page.tsx               # 9. 산출물 출력
│   └── versions/page.tsx             # 10. 버전 관리
├── templates/page.tsx                # 템플릿 관리
├── settings/page.tsx                 # 설정
├── api/
│   ├── projects/[...slug]/route.ts
│   ├── templates/route.ts
│   ├── admin/route.ts
│   ├── settings/route.ts
│   └── health/route.ts
├── layout.tsx
└── globals.css

components/
├── layout/                           # 기존 유지 (navbar, footer, theme-toggle)
├── providers/                        # 기존 유지 (theme-provider, auth-provider)
├── ui/                               # shadcn/ui 컴포넌트
├── project/                          # 프로젝트 컴포넌트
│   ├── step-navigation.tsx           # 10단계 네비게이션
│   ├── project-card.tsx
│   ├── progress-tracker.tsx
│   └── gate-indicator.tsx            # 검증 게이트 표시
├── rfp/                              # RFP 컴포넌트
│   ├── file-uploader.tsx
│   ├── analysis-card.tsx
│   ├── analysis-tabs.tsx             # 6개 탭 뷰
│   └── analysis-editor.tsx
├── proposal/                         # 제안서 컴포넌트
│   ├── direction-selector.tsx
│   ├── competitive-panel.tsx         # 경쟁 분석 + SWOT
│   ├── strategy-editor.tsx
│   ├── outline-tree.tsx
│   ├── heatmap-panel.tsx             # 목차-평가항목 히트맵
│   ├── section-editor.tsx
│   ├── req-tracking-panel.tsx        # REQ-ID 추적 패널
│   ├── mermaid-preview.tsx
│   ├── review-dashboard.tsx          # 검증 리포트 대시보드
│   ├── price-editor.tsx              # 가격 제안서 편집기
│   └── version-timeline.tsx          # 버전 관리 타임라인
├── guide/                            # 가이드 컴포넌트
│   └── tip-panel.tsx
├── output/                           # 산출물 컴포넌트
│   ├── output-preview.tsx
│   └── template-selector.tsx
└── admin/                            # 관리자 컴포넌트
    ├── user-management.tsx
    ├── usage-tracker.tsx
    └── llm-selector.tsx

lib/
├── utils.ts                          # 기존 유지
├── supabase/
│   ├── client.ts                     # Supabase 클라이언트
│   ├── server.ts                     # 서버 사이드 클라이언트
│   └── middleware.ts                 # Auth 미들웨어
├── db/
│   ├── schema.ts                     # Drizzle 스키마 (PostgreSQL)
│   ├── client.ts                     # DB 연결
│   └── migrations/
├── services/
│   ├── rfp-parser.service.ts
│   ├── ai-engine.service.ts          # 멀티 LLM 추상화
│   ├── analysis.service.ts
│   ├── direction.service.ts
│   ├── strategy.service.ts
│   ├── outline.service.ts
│   ├── section-generator.service.ts
│   ├── review.service.ts             # 검증 리포트
│   ├── price.service.ts              # 가격 제안서
│   ├── gate.service.ts               # 검증 게이트
│   ├── version.service.ts            # 버전 관리
│   ├── word-renderer.service.ts
│   └── ppt-renderer.service.ts
├── ai/
│   ├── client.ts                     # Claude 클라이언트
│   ├── openai-client.ts              # GPT 클라이언트
│   ├── llm-router.ts                 # LLM 선택 라우터
│   ├── agents/
│   │   ├── rfp-analyzer.ts           # RFP 7단계 분석 에이전트
│   │   ├── proposal-reviewer.ts      # 검증 리포트 에이전트
│   │   ├── price-proposal.ts         # 가격 제안 에이전트
│   │   └── service-analyst.ts        # 경쟁 분석 에이전트
│   ├── prompts/
│   │   ├── rfp-analysis.ts
│   │   ├── direction-generation.ts
│   │   ├── strategy-generation.ts
│   │   ├── outline-generation.ts
│   │   ├── section-generation.ts
│   │   ├── diagram-generation.ts
│   │   ├── review-generation.ts
│   │   ├── price-generation.ts
│   │   └── competitive-analysis.ts
│   └── types.ts
├── repositories/
│   ├── project.repository.ts
│   ├── rfp.repository.ts
│   ├── proposal.repository.ts
│   ├── review.repository.ts
│   ├── price.repository.ts
│   ├── version.repository.ts
│   └── template.repository.ts
└── validators/
    ├── project.schema.ts
    ├── rfp.schema.ts
    ├── proposal.schema.ts
    ├── review.schema.ts
    └── price.schema.ts

data/                                 # gitignore 대상
├── uploads/
├── outputs/
├── templates/
└── db/
```

---

## 10. MVP 범위

### Phase 1: MVP 골격 (완료) ✅

**포함**: 프로젝트 설정, DB 스키마, AI 클라이언트, Repository 패턴, 대시보드 UI, 프로젝트 API

### Phase 2: 핵심 인프라 (완료) ✅

**포함**: Supabase PostgreSQL, Supabase Auth 인증, 멀티 LLM (GPT + Claude), RFP 업로드, 7단계 분석, 가이드 페이지

### Phase 3: 제안서 생성 파이프라인 (진행 중)

**포함**: F-004 ~ F-012, F-017 ~ F-019 (방향성, 전략, 목차, 내용, 산출물, 검증 리포트, 추적 패널, 게이트)

### Phase 4: 수주 최적화 고도화

**포함**: F-108 ~ F-111 (가격 제안서, 경쟁 분석/SWOT, 히트맵, 버전 관리)

### Phase 5: 확장 기능

**포함**: F-201 이후 선별 구현 (HWP, 갭 분석, 협력사 관리, 컴플라이언스, 나라장터 모니터링)

---

## 11. 성공 지표 (KPI)

| KPI | 측정 방법 | 목표 |
| --- | --- | --- |
| 제안서 작성 시간 | RFP 업로드 → 최종 다운로드 | 기존 대비 70% 단축 |
| 초안 활용률 | 수정 없이 사용된 비율 | 60% 이상 |
| RFP 요구사항 커버리지 | 반영 요구사항 / 총 요구사항 | 95% 이상 |
| REQ-ID 추적 완전성 | 매핑된 REQ-ID / 전체 REQ-ID | 100% |
| 검증 리포트 정확도 | 예상 점수 vs 실제 점수 | ±10% 이내 |
| 프로젝트 완료율 | 완료 / 생성 프로젝트 | 80% 이상 |
| 시스템 가용성 | 월간 업타임 | 99% |

---

## 12. 제약사항 및 리스크

### 12.1 기술적 제약사항

| 제약 | 영향 | 대응 |
| --- | --- | --- |
| LLM API 토큰 제한 | 200페이지 전체를 한 번에 처리 불가 | 섹션 단위 분할 생성, 컨텍스트 요약 |
| LLM API 네트워크 의존 | AI 호출은 외부 네트워크 필요 | 멀티 LLM 폴백, 향후 로컬 LLM |
| PDF 파싱 품질 | 스캔 PDF, 이미지 기반 PDF 파싱 불가 | 텍스트 기반 PDF만 지원, OCR은 P2 |
| 한글(HWP) 파싱 | 공공기관 HWP 비율 높음 | MVP 제외, Phase 5에서 검토 |
| 가격 제안서 정확도 | AI 생성 단가는 참고용 | 사용자 최종 검토 필수, 단가 DB 연동 예정 |

### 12.2 비즈니스 리스크

| 리스크 | 심각도 | 대응 |
| --- | --- | --- |
| AI 생성 품질 부족 | 높음 | 멀티 LLM + 프롬프트 지속 개선 + 검증 리포트 |
| 보안 우려 (기밀 RFP 외부 전송) | 높음 | API 호출 최소화, 로컬 LLM 로드맵 |
| LLM API 비용 증가 | 중간 | 토큰 모니터링, 캐싱, LLM 라우팅 최적화 |
| 공공 제안서 형식 변경 | 중간 | 템플릿/프롬프트 분리로 유연 대응 |
| 검증 리포트 과신 | 중간 | "참고용" 명시, 사용자 검토 워크플로우 강제 |
