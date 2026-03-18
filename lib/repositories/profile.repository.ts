import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { profiles } from '@/lib/db/schema';
import type { AppRole } from '@/lib/db/schema';

export const profileRepository = {
  async findByUserId(userId: string) {
    const db = getDb();
    const results = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId));
    return results[0];
  },

  async upsert(data: {
    id: string;
    email: string;
    name: string;
    role?: AppRole;
    avatarUrl?: string | null;
  }) {
    const db = getDb();
    const now = new Date().toISOString();
    const existing = await this.findByUserId(data.id);

    if (existing) {
      await db
        .update(profiles)
        .set({
          email: data.email,
          name: data.name,
          avatarUrl: data.avatarUrl ?? existing.avatarUrl,
          updatedAt: now,
        })
        .where(eq(profiles.id, data.id));
    } else {
      await db.insert(profiles).values({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role ?? 'viewer',
        avatarUrl: data.avatarUrl ?? null,
        createdAt: now,
        updatedAt: now,
      });
    }

    return this.findByUserId(data.id);
  },

  async updateRole(userId: string, role: AppRole) {
    const db = getDb();
    await db
      .update(profiles)
      .set({ role, updatedAt: new Date().toISOString() })
      .where(eq(profiles.id, userId));
  },
};
