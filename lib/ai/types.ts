// RFP 분석 결과 타입

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

export interface RfpAnalysisResult {
  overview: {
    projectName: string;
    client: string;
    budget: string;
    duration: string;
    summary: string;
  };
  requirements: Requirement[];
  evaluationCriteria: EvaluationCriterion[];
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

// 방향성 후보 타입

export interface DirectionCandidate {
  title: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  fitScore: number;      // 0~100
}

// 전략 타입

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

// 목차 타입

export interface OutlineSection {
  id: string;
  title: string;
  level: number;
  order: number;
  children: OutlineSection[];
}

// SSE 이벤트 타입

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
