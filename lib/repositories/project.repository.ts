import { eq, desc } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { projects } from '@/lib/db/schema';
import type { ProjectStatus } from '@/lib/db/schema';

export const projectRepository = {
  async findAll() {
    const db = getDb();
    return db.select().from(projects).orderBy(desc(projects.createdAt));
  },

  async findById(id: string) {
    const db = getDb();
    const results = await db.select().from(projects).where(eq(projects.id, id));
    return results[0];
  },

  async create(title: string) {
    const db = getDb();
    const [project] = await db.insert(projects).values({
      title,
      status: 'uploaded' as ProjectStatus,
    }).returning();
    return project;
  },

  async updateStatus(id: string, status: ProjectStatus): Promise<void> {
    const db = getDb();
    await db
      .update(projects)
      .set({ status, updatedAt: new Date() })
      .where(eq(projects.id, id));
  },

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.delete(projects).where(eq(projects.id, id));
  },
};
