import type { PromptCategory } from '@/lib/db/schema';

import { RFP_ANALYSIS_SYSTEM_PROMPT, buildRfpAnalysisPrompt } from './rfp-analysis';
import { DIRECTION_SYSTEM_PROMPT, buildDirectionPrompt } from './direction-generation';
import { STRATEGY_SYSTEM_PROMPT, buildStrategyPrompt } from './strategy-generation';
import { OUTLINE_SYSTEM_PROMPT, buildOutlinePrompt } from './outline-generation';
import { SECTION_SYSTEM_PROMPT, buildSectionPrompt } from './section-generation';
import { REVIEW_SYSTEM_PROMPT, buildReviewPrompt } from './review-generation';
import { PRICE_SYSTEM_PROMPT, buildPricePrompt } from './price-generation';
import { COACHING_SYSTEM_PROMPT, buildCoachingPrompt } from './coaching';
import { COMPETITIVE_ANALYSIS_SYSTEM_PROMPT, buildCompetitiveAnalysisPrompt } from './competitive-analysis';

export interface DefaultPromptDef {
  slug: string;
  name: string;
  description: string;
  category: PromptCategory;
  systemPrompt: string;
  maxTokens: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buildUserPrompt: (...args: any[]) => string;
}

export const DEFAULT_PROMPTS: Record<string, DefaultPromptDef> = {
  'rfp-analysis': {
    slug: 'rfp-analysis',
    name: 'RFP 분석',
    description: 'RFP(제안요청서) 문서를 7단계로 체계적 분석하여 사업개요·평가항목·요구사항·추적성 매트릭스를 추출',
    category: 'analysis',
    systemPrompt: RFP_ANALYSIS_SYSTEM_PROMPT,
    maxTokens: 16384,
    buildUserPrompt: buildRfpAnalysisPrompt,
  },
  'direction-generation': {
    slug: 'direction-generation',
    name: '방향성 생성',
    description: 'RFP 분석 결과를 기반으로 3~5개의 제안 방향성 후보를 생성하고 적합도를 평가',
    category: 'generation',
    systemPrompt: DIRECTION_SYSTEM_PROMPT,
    maxTokens: 4096,
    buildUserPrompt: buildDirectionPrompt,
  },
  'strategy-generation': {
    slug: 'strategy-generation',
    name: '전략 수립',
    description: '선택된 방향성을 기반으로 경쟁 전략·차별화 포인트·핵심 메시지를 수립',
    category: 'generation',
    systemPrompt: STRATEGY_SYSTEM_PROMPT,
    maxTokens: 4096,
    buildUserPrompt: buildStrategyPrompt,
  },
  'outline-generation': {
    slug: 'outline-generation',
    name: '목차 생성',
    description: 'RFP 평가항목과 전략을 반영하여 계층형 제안서 목차 구조를 자동 생성',
    category: 'generation',
    systemPrompt: OUTLINE_SYSTEM_PROMPT,
    maxTokens: 4096,
    buildUserPrompt: buildOutlinePrompt,
  },
  'section-generation': {
    slug: 'section-generation',
    name: '섹션 작성',
    description: '목차의 각 섹션별 상세 내용(마크다운 본문 + Mermaid 다이어그램)을 생성',
    category: 'generation',
    systemPrompt: SECTION_SYSTEM_PROMPT,
    maxTokens: 4096,
    buildUserPrompt: buildSectionPrompt,
  },
  'review-generation': {
    slug: 'review-generation',
    name: '제안서 검증',
    description: '완성된 제안서를 RFP 평가항목 기준으로 검토하여 예상 점수·충족도·개선안을 산출',
    category: 'review',
    systemPrompt: REVIEW_SYSTEM_PROMPT,
    maxTokens: 16384,
    buildUserPrompt: buildReviewPrompt,
  },
  'price-generation': {
    slug: 'price-generation',
    name: '가격 산출',
    description: '기술 제안서와 RFP를 기반으로 사업비 산출내역서(인건비·장비비·제경비·간접비)를 생성',
    category: 'price',
    systemPrompt: PRICE_SYSTEM_PROMPT,
    maxTokens: 8192,
    buildUserPrompt: buildPricePrompt,
  },
  'coaching': {
    slug: 'coaching',
    name: 'AI 코칭',
    description: '제안서 작성 각 단계(분석·방향성·전략·목차)의 결과물을 분석하여 개선 피드백을 제공',
    category: 'coaching',
    systemPrompt: COACHING_SYSTEM_PROMPT,
    maxTokens: 4096,
    buildUserPrompt: buildCoachingPrompt,
  },
  'competitive-analysis': {
    slug: 'competitive-analysis',
    name: '경쟁 분석',
    description: 'RFP 분석 결과를 기반으로 SWOT 분석·경쟁 환경 분석·전략적 시사점을 도출',
    category: 'analysis',
    systemPrompt: COMPETITIVE_ANALYSIS_SYSTEM_PROMPT,
    maxTokens: 4096,
    buildUserPrompt: buildCompetitiveAnalysisPrompt,
  },
};

export function getDefaultPrompt(slug: string): DefaultPromptDef | undefined {
  return DEFAULT_PROMPTS[slug];
}

export function getAllDefaultPrompts(): DefaultPromptDef[] {
  return Object.values(DEFAULT_PROMPTS);
}
