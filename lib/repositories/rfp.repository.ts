import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db/client';
import { rfpFiles, rfpAnalyses } from '@/lib/db/schema';

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
    const file = {
      id: uuidv4(),
      ...data,
      uploadedAt: new Date().toISOString(),
    };
    await db.insert(rfpFiles).values(file);
    return file;
  },

  async getFileByProjectId(projectId: string) {
    const db = getDb();
    const results = await db
      .select()
      .from(rfpFiles)
      .where(eq(rfpFiles.projectId, projectId));
    return results[0];
  },

  async createAnalysis(data: {
    projectId: string;
    overview: string;
    requirements: string;
    evaluationCriteria: string;
    scope: string;
    constraints: string;
    keywords: string;
  }) {
    const db = getDb();
    const analysis = {
      id: uuidv4(),
      ...data,
      analyzedAt: new Date().toISOString(),
    };
    await db.insert(rfpAnalyses).values(analysis);
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
    overview: string;
    requirements: string;
    evaluationCriteria: string;
    scope: string;
    constraints: string;
    keywords: string;
  }>) {
    const db = getDb();
    await db.update(rfpAnalyses).set(data).where(eq(rfpAnalyses.id, id));
  },
};
