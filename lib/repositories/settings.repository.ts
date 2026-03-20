import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { aiSettings } from '@/lib/db/schema';
import type { AiProviderType } from '@/lib/db/schema';
import { encrypt, decrypt } from '@/lib/security/encrypt';

const DEFAULT_SETTINGS_ID = 'default';

export const settingsRepository = {
  async getAiSettings() {
    const db = getDb();
    const results = await db
      .select()
      .from(aiSettings)
      .where(eq(aiSettings.id, DEFAULT_SETTINGS_ID));

    if (results[0]) return results[0];

    const [defaultSettings] = await db.insert(aiSettings).values({
      id: DEFAULT_SETTINGS_ID,
      provider: 'claude' as AiProviderType,
      claudeModel: 'claude-sonnet-4-6',
      gptModel: 'gpt-4o',
    }).returning();
    return defaultSettings;
  },

  async updateAiSettings(data: {
    provider?: AiProviderType;
    claudeModel?: string;
    gptModel?: string;
    claudeApiKey?: string;
    gptApiKey?: string;
  }) {
    const db = getDb();
    const existing = await this.getAiSettings();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.provider) updateData.provider = data.provider;
    if (data.claudeModel) updateData.claudeModel = data.claudeModel;
    if (data.gptModel) updateData.gptModel = data.gptModel;
    if (data.claudeApiKey) updateData.claudeApiKey = encrypt(data.claudeApiKey);
    if (data.gptApiKey) updateData.gptApiKey = encrypt(data.gptApiKey);

    await db
      .update(aiSettings)
      .set(updateData)
      .where(eq(aiSettings.id, existing.id));

    return this.getAiSettings();
  },

  /** DB에서 복호화된 API 키 반환 */
  async getDecryptedApiKey(provider: 'claude' | 'gpt'): Promise<string | null> {
    const settings = await this.getAiSettings();
    const encryptedKey = provider === 'claude' ? settings.claudeApiKey : settings.gptApiKey;
    if (!encryptedKey) return null;
    try {
      return decrypt(encryptedKey);
    } catch {
      return null;
    }
  },
};
