import type { PromptCategory } from '@/lib/db/schema';

import { DIRECTION_SYSTEM_PROMPT, buildDirectionPrompt } from './direction-generation';
import { STRATEGY_SYSTEM_PROMPT, buildStrategyPrompt } from './strategy-generation';
import { OUTLINE_SYSTEM_PROMPT, buildOutlinePrompt } from './outline-generation';
import { SECTION_SYSTEM_PROMPT, buildSectionPrompt } from './section-generation';
import { REVIEW_SYSTEM_PROMPT, buildReviewPrompt } from './review-generation';
import { PRICE_SYSTEM_PROMPT, buildPricePrompt } from './price-generation';
import { COACHING_SYSTEM_PROMPT, buildCoachingPrompt } from './coaching';
import { COMPETITIVE_ANALYSIS_SYSTEM_PROMPT, buildCompetitiveAnalysisPrompt } from './competitive-analysis';
import { RFP_ASK_SYSTEM, buildRfpAskPrompt } from './rfp-ask';
import {
  STEP1_SYSTEM, buildStep1Prompt,
  STEP2_SYSTEM, buildStep2Prompt,
  STEP3_SYSTEM, buildStep3Prompt,
  STEP4_SYSTEM, buildStep4Prompt,
  STEP5_SYSTEM, buildStep5Prompt,
  STEP6_SYSTEM, buildStep6Prompt,
  STEP7_SYSTEM, buildStep7Prompt,
} from './rfp-steps';

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
  'rfp-step1-overview': {
    slug: 'rfp-step1-overview', name: 'Step 1: 사업 개요',
    description: 'RFP에서 사업명, 발주기관, 예산, 기간, 목적을 파악 (표/이미지 포함)',
    category: 'analysis', systemPrompt: STEP1_SYSTEM, maxTokens: 4096, buildUserPrompt: buildStep1Prompt,
  },
  'rfp-step2-evaluation': {
    slug: 'rfp-step2-evaluation', name: 'Step 2: 평가항목',
    description: 'EVAL-ID 부여, 배점표 추출 (이미지/표 포함), 배점 검증',
    category: 'analysis', systemPrompt: STEP2_SYSTEM, maxTokens: 8192, buildUserPrompt: buildStep2Prompt,
  },
  'rfp-step3-requirements': {
    slug: 'rfp-step3-requirements', name: 'Step 3: 요구사항',
    description: '7개 카테고리(FR/NFR/TR/HR/DR/SR/LR)로 요구사항 분류, REQ-ID 부여',
    category: 'analysis', systemPrompt: STEP3_SYSTEM, maxTokens: 16384, buildUserPrompt: buildStep3Prompt,
  },
  'rfp-step4-traceability': {
    slug: 'rfp-step4-traceability', name: 'Step 4: 추적성 매트릭스',
    description: 'REQ-ID ↔ EVAL-ID 매핑, 권장 챕터 연결',
    category: 'analysis', systemPrompt: STEP4_SYSTEM, maxTokens: 8192, buildUserPrompt: buildStep4Prompt,
  },
  'rfp-step5-qualifications': {
    slug: 'rfp-step5-qualifications', name: 'Step 5: 자격요건/범위/제약',
    description: '자격요건, 사업 범위(inScope/outOfScope), 기술/비즈니스/일정 제약사항',
    category: 'analysis', systemPrompt: STEP5_SYSTEM, maxTokens: 4096, buildUserPrompt: buildStep5Prompt,
  },
  'rfp-step6-strategy': {
    slug: 'rfp-step6-strategy', name: 'Step 6: 배점 전략',
    description: '평가항목별 고/중/저 전략, 핵심 실행 항목',
    category: 'analysis', systemPrompt: STEP6_SYSTEM, maxTokens: 8192, buildUserPrompt: buildStep6Prompt,
  },
  'rfp-step7-chapters': {
    slug: 'rfp-step7-chapters', name: 'Step 7: 권장 목차 + 키워드',
    description: '전체 분석 종합하여 최적 목차 구성, 핵심 키워드 추출',
    category: 'analysis', systemPrompt: STEP7_SYSTEM, maxTokens: 4096, buildUserPrompt: buildStep7Prompt,
  },
  'rfp-ask': {
    slug: 'rfp-ask', name: 'RFP 질의응답',
    description: 'RAG 기반 RFP 자유 질의응답 챗봇. 사용자가 제안서에 대해 자유롭게 질문하면 관련 내용을 찾아 답변',
    category: 'coaching', systemPrompt: RFP_ASK_SYSTEM, maxTokens: 4096, buildUserPrompt: buildRfpAskPrompt,
  },
};

export function getDefaultPrompt(slug: string): DefaultPromptDef | undefined {
  return DEFAULT_PROMPTS[slug];
}

export function getAllDefaultPrompts(): DefaultPromptDef[] {
  return Object.values(DEFAULT_PROMPTS);
}
