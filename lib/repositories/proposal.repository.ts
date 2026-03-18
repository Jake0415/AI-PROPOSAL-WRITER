import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db/client';
import {
  proposalDirections,
  proposalStrategies,
  proposalOutlines,
  proposalSections,
  outputFiles,
} from '@/lib/db/schema';
import type { SectionStatus } from '@/lib/db/schema';

export const proposalRepository = {
  // ─── Direction ──────────────────────────────────────────

  async createDirection(projectId: string, candidates: string) {
    const db = getDb();
    const direction = {
      id: uuidv4(),
      projectId,
      candidates,
      selectedIndex: -1,
      customNotes: '',
      confirmedAt: null,
    };
    await db.insert(proposalDirections).values(direction);
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
      .set({ selectedIndex, confirmedAt: new Date().toISOString() })
      .where(eq(proposalDirections.id, id));
  },

  // ─── Strategy ───────────────────────────────────────────

  async createStrategy(projectId: string, data: {
    competitiveStrategy: string;
    differentiators: string;
    keyMessages: string;
    writingStyle?: string;
  }) {
    const db = getDb();
    const strategy = {
      id: uuidv4(),
      projectId,
      competitiveStrategy: data.competitiveStrategy,
      differentiators: data.differentiators,
      keyMessages: data.keyMessages,
      writingStyle: data.writingStyle ?? 'formal',
      customNotes: '',
      confirmedAt: null,
    };
    await db.insert(proposalStrategies).values(strategy);
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

  async createOutline(projectId: string, sections: string) {
    const db = getDb();
    const outline = { id: uuidv4(), projectId, sections };
    await db.insert(proposalOutlines).values(outline);
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

  async updateOutline(id: string, sections: string) {
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
    diagrams: string;
    status: SectionStatus;
  }) {
    const db = getDb();
    const section = {
      id: uuidv4(),
      ...data,
      generatedAt: new Date().toISOString(),
      editedAt: null,
    };
    await db.insert(proposalSections).values(section);
    return section;
  },

  async getSectionsByProject(projectId: string) {
    const db = getDb();
    return db
      .select()
      .from(proposalSections)
      .where(eq(proposalSections.projectId, projectId));
  },

  async updateSection(id: string, data: Partial<{
    content: string;
    diagrams: string;
    status: SectionStatus;
    editedAt: string;
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
    const output = {
      id: uuidv4(),
      ...data,
      generatedAt: new Date().toISOString(),
      version: 1,
    };
    await db.insert(outputFiles).values(output);
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
