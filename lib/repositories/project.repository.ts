import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db/client';
import { projects } from '@/lib/db/schema';
import type { ProjectStatus } from '@/lib/db/schema';

export interface ProjectData {
  id: string;
  title: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export const projectRepository = {
  async findAll(): Promise<ProjectData[]> {
    const db = getDb();
    return db.select().from(projects).orderBy(desc(projects.createdAt));
  },

  async findById(id: string): Promise<ProjectData | undefined> {
    const db = getDb();
    const results = await db.select().from(projects).where(eq(projects.id, id));
    return results[0];
  },

  async create(title: string): Promise<ProjectData> {
    const db = getDb();
    const now = new Date().toISOString();
    const project: ProjectData = {
      id: uuidv4(),
      title,
      status: 'uploaded',
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(projects).values(project);
    return project;
  },

  async updateStatus(id: string, status: ProjectStatus): Promise<void> {
    const db = getDb();
    await db
      .update(projects)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(projects.id, id));
  },

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.delete(projects).where(eq(projects.id, id));
  },
};
