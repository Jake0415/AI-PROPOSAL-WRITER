import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { rfpFiles, rfpAnalyses } from '@/lib/db/schema';
import type {
  StructuredRequirement,
  EvaluationCriterion,
  EvaluationItem,
  TraceabilityMapping,
  Qualification,
  StrategyPoint,
  RecommendedChapter,
} from '@/lib/ai/types';

export const rfpRepository = {
  async createFile(data: {
    projectId: string;
    fileName: string;
    fileType: 'pdf' | 'docx';
    filePath: string;
    fileSize: number;
    rawText: string;
  }) {
    const db = getDb();
    const [file] = await db.insert(rfpFiles).values(data).returning();
    return file;
  },

  async getFileById(id: string) {
    const db = getDb();
    const results = await db
      .select()
      .from(rfpFiles)
      .where(eq(rfpFiles.id, id));
    return results[0];
  },

  async getFileByProjectId(projectId: string) {
    const db = getDb();
    const results = await db
      .select()
      .from(rfpFiles)
      .where(eq(rfpFiles.projectId, projectId));
    return results[0];
  },

  async updateGptFileId(projectId: string, gptFileId: string) {
    const db = getDb();
    await db.update(rfpFiles)
      .set({ gptFileId })
      .where(eq(rfpFiles.projectId, projectId));
  },

  async createAnalysis(data: {
    projectId: string;
    overview: { projectName: string; client: string; budget: string; duration: string; summary: string; purpose?: string };
    requirements: StructuredRequirement[];
    evaluationCriteria: EvaluationCriterion[];
    evaluationItems?: EvaluationItem[];
    traceabilityMatrix?: TraceabilityMapping[];
    qualifications?: Qualification[];
    strategyPoints?: StrategyPoint[];
    recommendedChapters?: RecommendedChapter[];
    scope: { inScope: string[]; outOfScope: string[] };
    constraints: { technical: string[]; business: string[]; timeline: string[] };
    keywords: string[];
  }) {
    const db = getDb();
    const [analysis] = await db.insert(rfpAnalyses).values({
      ...data,
      evaluationItems: data.evaluationItems ?? [],
      traceabilityMatrix: data.traceabilityMatrix ?? [],
      qualifications: data.qualifications ?? [],
      strategyPoints: data.strategyPoints ?? [],
      recommendedChapters: data.recommendedChapters ?? [],
    }).returning();
    return analysis;
  },

  async getAnalysisByProjectId(projectId: string) {
    const db = getDb();
    const results = await db
      .select()
      .from(rfpAnalyses)
      .where(eq(rfpAnalyses.projectId, projectId));
    return results[0];
  },

  async updateAnalysis(id: string, data: Partial<{
    overview: { projectName: string; client: string; budget: string; duration: string; summary: string; purpose?: string };
    requirements: StructuredRequirement[];
    evaluationCriteria: EvaluationCriterion[];
    evaluationItems: EvaluationItem[];
    traceabilityMatrix: TraceabilityMapping[];
    qualifications: Qualification[];
    strategyPoints: StrategyPoint[];
    recommendedChapters: RecommendedChapter[];
    scope: { inScope: string[]; outOfScope: string[] };
    constraints: { technical: string[]; business: string[]; timeline: string[] };
    keywords: string[];
  }>) {
    const db = getDb();
    await db.update(rfpAnalyses).set(data).where(eq(rfpAnalyses.id, id));
  },
};
