import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { rfpImageMetadata } from '@/lib/db/schema';

export const imageMetadataRepository = {
  async findByProjectId(projectId: string) {
    const db = getDb();
    return db.select().from(rfpImageMetadata)
      .where(eq(rfpImageMetadata.projectId, projectId));
  },

  async bulkCreate(items: Array<{
    projectId: string;
    pageNumber: number;
    imageIndex: number;
    imageType: 'element' | 'page_full';
    imagePath: string;
    width?: number;
    height?: number;
    description?: string;
    keywords?: string[];
  }>) {
    if (items.length === 0) return [];
    const db = getDb();
    return db.insert(rfpImageMetadata).values(items).returning();
  },

  async updateMetadata(id: string, data: { description?: string; keywords?: string[] }) {
    const db = getDb();
    await db.update(rfpImageMetadata)
      .set(data)
      .where(eq(rfpImageMetadata.id, id));
  },

  async deleteByProjectId(projectId: string) {
    const db = getDb();
    await db.delete(rfpImageMetadata).where(eq(rfpImageMetadata.projectId, projectId));
  },
};
