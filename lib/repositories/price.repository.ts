import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db/client';
import { priceProposals } from '@/lib/db/schema';

export const priceRepository = {
  async create(data: {
    projectId: string;
    laborCosts: string;
    equipmentCosts: string;
    expenseCosts: string;
    indirectCosts: string;
    summary: string;
    competitiveness: string;
  }) {
    const db = getDb();
    const proposal = {
      id: uuidv4(),
      ...data,
      generatedAt: new Date().toISOString(),
    };
    await db.insert(priceProposals).values(proposal);
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
