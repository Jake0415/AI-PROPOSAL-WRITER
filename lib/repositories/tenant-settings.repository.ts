import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { tenantSettings } from '@/lib/db/schema';

const DEFAULT_ID = 'default';

export const tenantSettingsRepository = {
  async get() {
    const db = getDb();
    const results = await db
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.id, DEFAULT_ID));

    if (results[0]) return results[0];

    const [created] = await db.insert(tenantSettings).values({
      id: DEFAULT_ID,
      appName: 'AIPROWRITER',
      logoUrl: '',
      primaryColor: '',
    }).returning();
    return created;
  },

  async update(data: {
    appName?: string;
    logoUrl?: string;
    primaryColor?: string;
  }) {
    const db = getDb();
    const existing = await this.get();
    await db
      .update(tenantSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tenantSettings.id, existing.id));
    return this.get();
  },
};
