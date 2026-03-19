import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { reviewReports } from '@/lib/db/schema';
import type { ReviewGrade } from '@/lib/db/schema';
import type { EvalItemReviewResult, ReqReviewResult, ReviewImprovement } from '@/lib/ai/types';

export const reviewRepository = {
  async create(data: {
    projectId: string;
    overallScore: number;
    totalPossible: number;
    grade: ReviewGrade;
    evalCoverage: number;
    reqCoverage: number;
    formatCompliance: number;
    evalResults: EvalItemReviewResult[];
    reqResults: ReqReviewResult[];
    improvements: ReviewImprovement[];
    summary: string;
  }) {
    const db = getDb();
    const [report] = await db.insert(reviewReports).values(data).returning();
    return report;
  },

  async getByProjectId(projectId: string) {
    const db = getDb();
    const results = await db
      .select()
      .from(reviewReports)
      .where(eq(reviewReports.projectId, projectId));
    return results[0];
  },
};
