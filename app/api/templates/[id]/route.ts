import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { unlink } from 'fs/promises';
import { getDb } from '@/lib/db/client';
import { templates } from '@/lib/db/schema';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const db = getDb();

    const [template] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, id));

    if (!template) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '템플릿을 찾을 수 없습니다' } },
        { status: 404 },
      );
    }

    if (template.isDefault) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '기본 템플릿은 삭제할 수 없습니다' } },
        { status: 403 },
      );
    }

    // 파일 삭제
    try { await unlink(template.filePath); } catch { /* 파일 없어도 무시 */ }

    await db.delete(templates).where(eq(templates.id, id));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_ERROR', message: '템플릿 삭제에 실패했습니다' } },
      { status: 500 },
    );
  }
}
