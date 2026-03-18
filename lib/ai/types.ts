// ─── 요구사항 카테고리 ─────────────────────────────────────

export type RequirementCategory =
  | 'FR'   // Functional Requirement (기능)
  | 'NFR'  // Non-Functional Requirement (비기능)
  | 'TR'   // Technical Requirement (기술규격)
  | 'HR'   // Human Resource Requirement (인력)
  | 'DR'   // Deliverable Requirement (산출물)
  | 'SR'   // Schedule Requirement (일정)
  | 'LR';  // Legal/Regulatory Requirement (법규)

export const REQUIREMENT_CATEGORY_LABELS: Record<RequirementCategory, string> = {
  FR: '기능 요구사항',
  NFR: '비기능 요구사항',
  TR: '기술 규격',
  HR: '인력 요건',
  DR: '납품 산출물',
  SR: '일정 조건',
  LR: '법규 준수',
};

// ─── 구조화된 요구사항 (REQ-ID 체계) ──────────────────────

export interface StructuredRequirement {
  id: string;                    // REQ-FR-001 형태
  category: RequirementCategory;
  title: string;
  description: string;
  mandatory: boolean;            // 필수 여부
  source?: string;               // RFP 출처 (페이지, 섹션)
  acceptanceCriteria?: string;   // 수용 기준
}

// ─── 평가항목 (EVAL-ID 체계) ──────────────────────────────

export type StrategyPriority = 'high' | 'medium' | 'low';

export interface EvaluationItem {
  id: string;                    // EVAL-001 형태
  category: string;              // 대분류 (기술부문, 가격부문 등)
  item: string;                  // 평가항목명
  score: number;                 // 배점
  weight: number;                // 가중치 (%)
  criteria?: string;             // 세부평가기준
  priority: StrategyPriority;    // 전략 우선순위 (고/중/저)
}

// ─── 추적성 매트릭스 ──────────────────────────────────────

export interface TraceabilityMapping {
  requirementId: string;          // REQ-FR-001
  evaluationItemId: string;       // EVAL-003
  proposalChapter?: string;       // 권장 챕터 (03-수행방안)
}

// ─── 자격요건 ─────────────────────────────────────────────

export interface Qualification {
  type: 'eligibility' | 'deadline' | 'subcontract' | 'warranty' | 'legal';
  description: string;
  mandatory: boolean;
}

// ─── 배점 전략 ────────────────────────────────────────────

export interface StrategyPoint {
  priority: StrategyPriority;
  evalIds: string[];
  totalScore: number;
  recommendedRatio: number;      // 권장 분량 비율 (%)
  strategy: string;              // 전략 설명
}

// ─── 권장 목차 ────────────────────────────────────────────

export interface RecommendedChapter {
  chapter: string;               // "01-사업이해도"
  evalId: string;                // EVAL-001
  score: number;
  relatedRequirements: string[]; // ["REQ-FR-001", "REQ-FR-002"]
  recommendedPages: number;      // 권장 페이지 수
}

// ─── 수주 최적화 RFP 분석 결과 (확장) ─────────────────────

export interface RfpAnalysisResult {
  overview: {
    projectName: string;
    client: string;
    budget: string;
    duration: string;
    summary: string;
    purpose?: string;
  };
  evaluationItems: EvaluationItem[];
  requirements: StructuredRequirement[];
  traceabilityMatrix: TraceabilityMapping[];
  qualifications: Qualification[];
  strategyPoints: StrategyPoint[];
  recommendedChapters: RecommendedChapter[];
  scope: {
    inScope: string[];
    outOfScope: string[];
  };
  constraints: {
    technical: string[];
    business: string[];
    timeline: string[];
  };
  keywords: string[];
}

// ─── 하위 호환 타입 (기존 코드용) ─────────────────────────

export interface Requirement {
  id: string;
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface EvaluationCriterion {
  category: string;
  item: string;
  score: number;
  description: string;
}

// ─── 방향성 후보 타입 ─────────────────────────────────────

export interface DirectionCandidate {
  title: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  fitScore: number;
}

// ─── 전략 타입 ────────────────────────────────────────────

export interface Differentiator {
  title: string;
  description: string;
  evidence: string;
}

export interface ProposalStrategyResult {
  competitiveStrategy: string;
  differentiators: Differentiator[];
  keyMessages: string[];
}

// ─── 목차 타입 ────────────────────────────────────────────

export interface OutlineSection {
  id: string;
  title: string;
  level: number;
  order: number;
  children: OutlineSection[];
}

// ─── SSE 이벤트 타입 ──────────────────────────────────────

export interface SSEEvent {
  type: 'progress' | 'chunk' | 'complete' | 'error';
  data: {
    step?: string;
    progress?: number;
    content?: string;
    result?: unknown;
    error?: { code: string; message: string };
  };
}
