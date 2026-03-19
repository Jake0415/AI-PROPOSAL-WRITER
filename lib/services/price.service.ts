import { generateText } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import { priceRepository } from '@/lib/repositories/price.repository';
import {
  PRICE_SYSTEM_PROMPT,
  buildPricePrompt,
} from '@/lib/ai/prompts/price-generation';
import type { PriceProposalResult } from '@/lib/ai/types';
import type { SSEProgress } from '@/lib/utils/sse-stream';

type ProgressCallback = (p: SSEProgress) => void;

function parsePriceJson(result: string): PriceProposalResult {
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
  } catch {
    return {
      laborCosts: [],
      equipmentCosts: [],
      expenseCosts: [],
      indirectCosts: { generalAdmin: 0, generalAdminRate: 0, profit: 0, profitRate: 0 },
      summary: {
        directLabor: 0, directExpense: 0, miscExpense: 0, directSubtotal: 0,
        generalAdmin: 0, profit: 0, indirectSubtotal: 0,
        supplyPrice: 0, vat: 0, totalPrice: 0,
      },
      competitiveness: { budgetRatio: 0, recommendedRange: '', strategy: '' },
    };
  }
}

export async function generatePrice(
  projectId: string,
  onProgress?: ProgressCallback,
): Promise<PriceProposalResult> {
  onProgress?.({ step: '데이터 로딩', progress: 10 });

  const [analysis, sections] = await Promise.all([
    rfpRepository.getAnalysisByProjectId(projectId),
    proposalRepository.getSectionsByProject(projectId),
  ]);

  if (!analysis) {
    throw new Error('RFP 분석 결과가 필요합니다');
  }

  onProgress?.({ step: '가격 산출 중 (AI 분석)', progress: 30 });

  const analysisJson = JSON.stringify({
    overview: analysis.overview,
    requirements: analysis.requirements,
    evaluationItems: analysis.evaluationItems,
  });

  const sectionsJson = JSON.stringify(
    sections.map((s) => ({
      title: s.title,
      content: s.content.slice(0, 500),
    })),
  );

  const result = await generateText({
    systemPrompt: PRICE_SYSTEM_PROMPT,
    userPrompt: buildPricePrompt(analysisJson, sectionsJson),
    maxTokens: 8192,
  });

  onProgress?.({ step: '결과 저장', progress: 85 });

  const priceData = parsePriceJson(result);

  await priceRepository.create({
    projectId,
    laborCosts: priceData.laborCosts ?? [],
    equipmentCosts: priceData.equipmentCosts ?? [],
    expenseCosts: priceData.expenseCosts ?? [],
    indirectCosts: priceData.indirectCosts ?? { generalAdmin: 0, generalAdminRate: 0, profit: 0, profitRate: 0 },
    summary: priceData.summary ?? {} as PriceProposalResult['summary'],
    competitiveness: priceData.competitiveness ?? { budgetRatio: 0, recommendedRange: '', strategy: '' },
  });

  onProgress?.({ step: '완료', progress: 100 });

  return priceData;
}
