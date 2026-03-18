import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { aiSettings } from '@/lib/db/schema';
import type { AiProviderType } from '@/lib/db/schema';

const DEFAULT_SETTINGS_ID = 'default';

export const settingsRepository = {
  async getAiSettings() {
    const db = getDb();
    const results = await db
      .select()
      .from(aiSettings)
      .where(eq(aiSettings.id, DEFAULT_SETTINGS_ID));

    if (results[0]) return results[0];

    // 기본 설정이 없으면 생성
    const defaultSettings = {
      id: DEFAULT_SETTINGS_ID,
      provider: 'claude' as AiProviderType,
      claudeModel: 'claude-sonnet-4-6',
      gptModel: 'gpt-4o',
      updatedAt: new Date().toISOString(),
    };
    await db.insert(aiSettings).values(defaultSettings);
    return defaultSettings;
  },

  async updateAiSettings(data: {
    provider?: AiProviderType;
    claudeModel?: string;
    gptModel?: string;
  }) {
    const db = getDb();
    const existing = await this.getAiSettings();
    await db
      .update(aiSettings)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(aiSettings.id, existing.id));

    return this.getAiSettings();
  },
};
