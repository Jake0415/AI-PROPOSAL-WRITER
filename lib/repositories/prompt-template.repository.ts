import { eq, desc } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { promptTemplates, promptTemplateVersions } from '@/lib/db/schema';
import type { PromptCategory } from '@/lib/db/schema';

export const promptTemplateRepository = {
  async findAll(filter?: { category?: PromptCategory; isActive?: boolean }) {
    const db = getDb();
    let query = db.select().from(promptTemplates);

    if (filter?.category) {
      query = query.where(eq(promptTemplates.category, filter.category)) as typeof query;
    }
    if (filter?.isActive !== undefined) {
      query = query.where(eq(promptTemplates.isActive, filter.isActive)) as typeof query;
    }

    return query;
  },

  async findBySlug(slug: string) {
    const db = getDb();
    const results = await db
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.slug, slug));
    return results[0] ?? null;
  },

  async create(data: {
    slug: string;
    name: string;
    description: string;
    category: PromptCategory;
    systemPrompt: string;
    userPromptTemplate: string;
    maxTokens: number;
    metadata?: Record<string, unknown>;
  }) {
    const db = getDb();
    const [result] = await db.insert(promptTemplates).values({
      ...data,
      metadata: data.metadata ?? {},
    }).returning();
    return result;
  },

  async update(id: string, data: Partial<{
    name: string;
    description: string;
    systemPrompt: string;
    userPromptTemplate: string;
    maxTokens: number;
    version: number;
    isActive: boolean;
    metadata: Record<string, unknown>;
  }>) {
    const db = getDb();
    const [result] = await db
      .update(promptTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(promptTemplates.id, id))
      .returning();
    return result;
  },

  async deleteBySlug(slug: string) {
    const db = getDb();
    await db.delete(promptTemplates).where(eq(promptTemplates.slug, slug));
  },

  async getVersions(templateId: string, limit = 20) {
    const db = getDb();
    return db
      .select()
      .from(promptTemplateVersions)
      .where(eq(promptTemplateVersions.templateId, templateId))
      .orderBy(desc(promptTemplateVersions.version))
      .limit(limit);
  },

  async getVersion(templateId: string, version: number) {
    const db = getDb();
    const results = await db
      .select()
      .from(promptTemplateVersions)
      .where(eq(promptTemplateVersions.templateId, templateId));
    return results.find((v) => v.version === version) ?? null;
  },

  async createVersion(data: {
    templateId: string;
    version: number;
    systemPrompt: string;
    userPromptTemplate: string;
    maxTokens: number;
    changedBy?: string;
    changeNote?: string;
  }) {
    const db = getDb();
    const [result] = await db.insert(promptTemplateVersions).values({
      ...data,
      changeNote: data.changeNote ?? '',
    }).returning();
    return result;
  },
};
