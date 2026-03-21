import { NextRequest, NextResponse } from 'next/server';
import { auditService } from '@/lib/services/audit.service';
import type { AuditAction, AuditResourceType } from '@/lib/db/schema';
import { requireRole } from '@/lib/auth/with-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole('admin');
    if (auth instanceof NextResponse) return auth;
    const sp = request.nextUrl.searchParams;

    const filter = {
      userId: sp.get('userId') || undefined,
      action: (sp.get('action') || undefined) as AuditAction | undefined,
      resourceType: (sp.get('resourceType') || undefined) as AuditResourceType | undefined,
      from: sp.get('from') ? new Date(sp.get('from')!) : undefined,
      to: sp.get('to') ? new Date(sp.get('to')!) : undefined,
      page: sp.get('page') ? Number(sp.get('page')) : 1,
      limit: sp.get('limit') ? Math.min(Number(sp.get('limit')), 100) : 50,
    };

    const result = await auditService.findAll(filter);

    return NextResponse.json({ success: true, ...result });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'AUDIT_ERROR', message: '감사 로그 조회에 실패했습니다' } },
      { status: 500 },
    );
  }
}
