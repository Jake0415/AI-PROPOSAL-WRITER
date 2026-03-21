import { eq, and, asc, gte } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { analysisSteps } from '@/lib/db/schema';
import type { AnalysisStepStatus } from '@/lib/db/schema';

export const analysisStepRepository = {
  async getByProject(projectId: string) {
    const db = getDb();
    return db.select().from(analysisSteps)
      .where(eq(analysisSteps.projectId, projectId))
      .orderBy(asc(analysisSteps.stepNumber));
  },

  async getByStep(projectId: string, stepNumber: number) {
    const db = getDb();
    const [row] = await db.select().from(analysisSteps)
      .where(and(
        eq(analysisSteps.projectId, projectId),
        eq(analysisSteps.stepNumber, stepNumber),
      ));
    return row ?? null;
  },

  async upsert(data: {
    projectId: string;
    stepNumber: number;
    slug: string;
    status: AnalysisStepStatus;
    result?: Record<string, unknown> | null;
    promptUsed?: string | null;
    errorMessage?: string | null;
  }) {
    const db = getDb();
    const existing = await this.getByStep(data.projectId, data.stepNumber);

    if (existing) {
      const [row] = await db.update(analysisSteps)
        .set({
          status: data.status,
          result: data.result ?? existing.result,
          promptUsed: data.promptUsed ?? existing.promptUsed,
          errorMessage: data.errorMessage ?? null,
          updatedAt: new Date(),
        })
        .where(eq(analysisSteps.id, existing.id))
        .returning();
      return row;
    }

    const [row] = await db.insert(analysisSteps).values({
      projectId: data.projectId,
      stepNumber: data.stepNumber,
      slug: data.slug,
      status: data.status,
      result: data.result ?? null,
      promptUsed: data.promptUsed ?? null,
      errorMessage: data.errorMessage ?? null,
    }).returning();
    return row;
  },

  async updateResult(projectId: string, stepNumber: number, result: Record<string, unknown>) {
    const db = getDb();
    const existing = await this.getByStep(projectId, stepNumber);
    if (!existing) return null;

    const [row] = await db.update(analysisSteps)
      .set({ result, status: 'completed' as const, updatedAt: new Date() })
      .where(eq(analysisSteps.id, existing.id))
      .returning();
    return row;
  },

  async resetFromStep(projectId: string, fromStepNumber: number) {
    const db = getDb();
    await db.update(analysisSteps)
      .set({ status: 'pending' as const, result: null, errorMessage: null, updatedAt: new Date() })
      .where(and(
        eq(analysisSteps.projectId, projectId),
        gte(analysisSteps.stepNumber, fromStepNumber),
      ));
  },
};
