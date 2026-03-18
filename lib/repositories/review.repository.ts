import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db/client';
import { reviewReports } from '@/lib/db/schema';
import type { ReviewGrade } from '@/lib/db/schema';

export const reviewRepository = {
  async create(data: {
    projectId: string;
    overallScore: number;
    totalPossible: number;
    grade: ReviewGrade;
    evalCoverage: number;
    reqCoverage: number;
    formatCompliance: number;
    evalResults: string;
    reqResults: string;
    improvements: string;
    summary: string;
  }) {
    const db = getDb();
    const report = {
      id: uuidv4(),
      ...data,
      generatedAt: new Date().toISOString(),
    };
    await db.insert(reviewReports).values(report);
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
