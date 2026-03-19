import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { priceProposals } from '@/lib/db/schema';
import type {
  LaborCostItem,
  EquipmentCostItem,
  ExpenseCostItem,
  IndirectCosts,
  PriceSummary,
  PriceCompetitiveness,
} from '@/lib/ai/types';

export const priceRepository = {
  async create(data: {
    projectId: string;
    laborCosts: LaborCostItem[];
    equipmentCosts: EquipmentCostItem[];
    expenseCosts: ExpenseCostItem[];
    indirectCosts: IndirectCosts;
    summary: PriceSummary;
    competitiveness: PriceCompetitiveness;
  }) {
    const db = getDb();
    const [proposal] = await db.insert(priceProposals).values(data).returning();
    return proposal;
  },

  async getByProjectId(projectId: string) {
    const db = getDb();
    const results = await db
      .select()
      .from(priceProposals)
      .where(eq(priceProposals.projectId, projectId));
    return results[0];
  },
};
