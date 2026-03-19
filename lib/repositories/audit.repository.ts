import { desc, eq, and, gte, lte, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { auditLogs, profiles } from '@/lib/db/schema';
import type { AuditAction, AuditResourceType } from '@/lib/db/schema';

interface AuditLogEntry {
  userId?: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

interface AuditLogFilter {
  userId?: string;
  action?: AuditAction;
  resourceType?: AuditResourceType;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}

export const auditRepository = {
  async create(entry: AuditLogEntry) {
    const db = getDb();
    const [log] = await db.insert(auditLogs).values(entry).returning();
    return log;
  },

  async findAll(filter: AuditLogFilter = {}) {
    const db = getDb();
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 50;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (filter.userId) conditions.push(eq(auditLogs.userId, filter.userId));
    if (filter.action) conditions.push(eq(auditLogs.action, filter.action));
    if (filter.resourceType) conditions.push(eq(auditLogs.resourceType, filter.resourceType));
    if (filter.from) conditions.push(gte(auditLogs.createdAt, filter.from));
    if (filter.to) conditions.push(lte(auditLogs.createdAt, filter.to));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      db
        .select({
          id: auditLogs.id,
          userId: auditLogs.userId,
          userName: profiles.name,
          action: auditLogs.action,
          resourceType: auditLogs.resourceType,
          resourceId: auditLogs.resourceId,
          details: auditLogs.details,
          ipAddress: auditLogs.ipAddress,
          createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .leftJoin(profiles, eq(auditLogs.userId, profiles.id))
        .where(where)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .where(where),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total: Number(countResult[0].count),
      },
    };
  },
};
