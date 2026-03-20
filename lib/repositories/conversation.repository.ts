import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { conversations, messages, llmCallLogs } from '@/lib/db/schema';
import type { ConversationTopic } from '@/lib/db/schema';

export const conversationRepository = {
  async create(data: {
    projectId: string;
    userId: string;
    topic: ConversationTopic;
    stageContext?: Record<string, unknown>;
  }) {
    const db = getDb();
    const [row] = await db.insert(conversations).values({
      projectId: data.projectId,
      userId: data.userId,
      topic: data.topic,
      stageContext: data.stageContext ?? {},
    }).returning();
    return row;
  },

  async findByProject(projectId: string, status?: 'active' | 'archived') {
    const db = getDb();
    const conditions = [eq(conversations.projectId, projectId)];
    if (status) conditions.push(eq(conversations.status, status));
    return db.select().from(conversations)
      .where(and(...conditions))
      .orderBy(desc(conversations.lastMessageAt));
  },

  async findById(id: string) {
    const db = getDb();
    const [row] = await db.select().from(conversations)
      .where(eq(conversations.id, id));
    return row ?? null;
  },

  async archive(id: string) {
    const db = getDb();
    const [row] = await db.update(conversations)
      .set({ status: 'archived' as const })
      .where(eq(conversations.id, id))
      .returning();
    return row ?? null;
  },

  async addMessage(data: {
    conversationId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    tokenUsage?: { prompt: number; completion: number } | null;
  }) {
    const db = getDb();
    const [msg] = await db.insert(messages).values({
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
      tokenUsage: data.tokenUsage ?? null,
    }).returning();

    await db.update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, data.conversationId));

    return msg;
  },

  async getMessages(conversationId: string) {
    const db = getDb();
    return db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  },

  async logLlmCall(data: {
    projectId?: string;
    conversationId?: string;
    service: string;
    provider: 'claude' | 'gpt';
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalCost: string;
    latencyMs: number;
  }) {
    const db = getDb();
    const [row] = await db.insert(llmCallLogs).values(data).returning();
    return row;
  },

  async getLlmLogs(options?: { projectId?: string; limit?: number }) {
    const db = getDb();
    let query = db.select().from(llmCallLogs).orderBy(desc(llmCallLogs.createdAt));
    if (options?.projectId) {
      query = query.where(eq(llmCallLogs.projectId, options.projectId)) as typeof query;
    }
    return query.limit(options?.limit ?? 100);
  },
};
