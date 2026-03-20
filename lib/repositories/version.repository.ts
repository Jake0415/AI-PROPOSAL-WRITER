import { eq, desc } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { proposalVersions } from '@/lib/db/schema';

export const versionRepository = {
  async create(data: {
    projectId: string;
    label: string;
    snapshot: Record<string, unknown>;
    createdBy?: string;
  }) {
    const db = getDb();
    const existing = await this.findByProject(data.projectId);
    const nextVersion = existing.length > 0 ? Math.max(...existing.map(v => v.versionNumber)) + 1 : 1;

    const [row] = await db.insert(proposalVersions).values({
      projectId: data.projectId,
      versionNumber: nextVersion,
      label: data.label,
      snapshot: data.snapshot,
      createdBy: data.createdBy,
    }).returning();
    return row;
  },

  async findByProject(projectId: string) {
    const db = getDb();
    return db.select().from(proposalVersions)
      .where(eq(proposalVersions.projectId, projectId))
      .orderBy(desc(proposalVersions.versionNumber));
  },

  async findById(id: string) {
    const db = getDb();
    const [row] = await db.select().from(proposalVersions)
      .where(eq(proposalVersions.id, id));
    return row ?? null;
  },
};
