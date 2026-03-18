// 단계 키 타입
export type StepKey =
  | 'upload'
  | 'analysis'
  | 'direction'
  | 'strategy'
  | 'outline'
  | 'sections'
  | 'output';

// 팁 중요도
export type TipImportance = 'high' | 'medium' | 'low';

// 팁 카테고리
export type TipCategory = 'principle' | 'public-bid' | 'practical';

// 단계별 팁
export interface StepTip {
  id: string;
  stepKey: StepKey;
  title: string;
  content: string;
  importance: TipImportance;
  category: TipCategory;
}

// 가이드 카테고리
export type GuideCategory = 'basic' | 'public-bid' | 'step-detail';

// 가이드 항목
export interface GuideItem {
  id: string;
  title: string;
  content: string;
  tips: string[];
  examples?: string[];
}

// 가이드 섹션
export interface GuideSection {
  id: string;
  title: string;
  category: GuideCategory;
  order: number;
  items: GuideItem[];
}

// AI 코칭 피드백 등급
export type CoachingRating = 'good' | 'needs-improvement' | 'critical';

// AI 코칭 개별 피드백
export interface CoachingFeedback {
  area: string;
  rating: CoachingRating;
  comment: string;
  suggestion: string;
}

// AI 코칭 결과
export interface CoachingResult {
  overallScore: number;
  summary: string;
  feedback: CoachingFeedback[];
}
