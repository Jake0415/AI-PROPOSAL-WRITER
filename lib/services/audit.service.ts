import { auditRepository } from '@/lib/repositories/audit.repository';
import type { AuditAction, AuditResourceType } from '@/lib/db/schema';
import { headers } from 'next/headers';

interface LogParams {
  userId?: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  details?: Record<string, unknown>;
}

async function getRequestMeta() {
  try {
    const h = await headers();
    return {
      ipAddress: h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown',
      userAgent: h.get('user-agent') || undefined,
    };
  } catch {
    return { ipAddress: undefined, userAgent: undefined };
  }
}

export const auditService = {
  async log(params: LogParams) {
    const meta = await getRequestMeta();
    return auditRepository.create({
      ...params,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
  },

  async findAll(filter?: Parameters<typeof auditRepository.findAll>[0]) {
    return auditRepository.findAll(filter);
  },
};
