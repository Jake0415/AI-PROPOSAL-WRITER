import { eq, and } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import {
  proposalDirections,
  proposalStrategies,
  proposalOutlines,
  proposalSections,
  outputFiles,
} from '@/lib/db/schema';
import type { SectionStatus } from '@/lib/db/schema';
import type { DirectionCandidate, Differentiator, OutlineSection } from '@/lib/ai/types';

export const proposalRepository = {
  // ─── Direction ──────────────────────────────────────────

  async createDirection(projectId: string, candidates: DirectionCandidate[]) {
    const db = getDb();
    const [direction] = await db.insert(proposalDirections).values({
      projectId,
      candidates,
      selectedIndex: -1,
      customNotes: '',
    }).returning();
    return direction;
  },

  async getDirection(projectId: string) {
    const db = getDb();
    const results = await db
      .select()
      .from(proposalDirections)
      .where(eq(proposalDirections.projectId, projectId));
    return results[0];
  },

  async selectDirection(id: string, selectedIndex: number) {
    const db = getDb();
    await db
      .update(proposalDirections)
      .set({ selectedIndex, confirmedAt: new Date() })
      .where(eq(proposalDirections.id, id));
  },

  // ─── Strategy ───────────────────────────────────────────

  async createStrategy(projectId: string, data: {
    competitiveStrategy: string;
    differentiators: Differentiator[];
    keyMessages: string[];
    writingStyle?: string;
  }) {
    const db = getDb();
    const [strategy] = await db.insert(proposalStrategies).values({
      projectId,
      competitiveStrategy: data.competitiveStrategy,
      differentiators: data.differentiators,
      keyMessages: data.keyMessages,
      writingStyle: data.writingStyle ?? 'formal',
      customNotes: '',
    }).returning();
    return strategy;
  },

  async getStrategy(projectId: string) {
    const db = getDb();
    const results = await db
      .select()
      .from(proposalStrategies)
      .where(eq(proposalStrategies.projectId, projectId));
    return results[0];
  },

  // ─── Outline ────────────────────────────────────────────

  async createOutline(projectId: string, sections: OutlineSection[]) {
    const db = getDb();
    const [outline] = await db.insert(proposalOutlines).values({
      projectId,
      sections,
    }).returning();
    return outline;
  },

  async getOutline(projectId: string) {
    const db = getDb();
    const results = await db
      .select()
      .from(proposalOutlines)
      .where(eq(proposalOutlines.projectId, projectId));
    return results[0];
  },

  async updateOutline(id: string, sections: OutlineSection[]) {
    const db = getDb();
    await db
      .update(proposalOutlines)
      .set({ sections })
      .where(eq(proposalOutlines.id, id));
  },

  // ─── Sections ───────────────────────────────────────────

  async createSection(data: {
    projectId: string;
    outlineId: string;
    sectionPath: string;
    title: string;
    content: string;
    diagrams: unknown[];
    status: SectionStatus;
  }) {
    const db = getDb();
    const [section] = await db.insert(proposalSections).values({
      ...data,
      generatedAt: new Date(),
    }).returning();
    return section;
  },

  async getSectionsByProject(projectId: string) {
    const db = getDb();
    return db
      .select()
      .from(proposalSections)
      .where(eq(proposalSections.projectId, projectId));
  },

  async getSectionByPath(projectId: string, sectionPath: string) {
    const db = getDb();
    const results = await db
      .select()
      .from(proposalSections)
      .where(and(
        eq(proposalSections.projectId, projectId),
        eq(proposalSections.sectionPath, sectionPath),
      ));
    return results[0] ?? null;
  },

  async updateSection(id: string, data: Partial<{
    title: string;
    content: string;
    diagrams: unknown[];
    status: SectionStatus;
    editedAt: Date;
  }>) {
    const db = getDb();
    await db
      .update(proposalSections)
      .set(data)
      .where(eq(proposalSections.id, id));
  },

  // ─── Output ─────────────────────────────────────────────

  async createOutput(data: {
    projectId: string;
    type: 'word' | 'ppt';
    templateId: string | null;
    filePath: string;
    fileName: string;
  }) {
    const db = getDb();
    const [output] = await db.insert(outputFiles).values({
      ...data,
      version: 1,
    }).returning();
    return output;
  },

  async getOutputsByProject(projectId: string) {
    const db = getDb();
    return db
      .select()
      .from(outputFiles)
      .where(eq(outputFiles.projectId, projectId));
  },
};
