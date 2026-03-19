import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { templates } from '@/lib/db/schema';

// 템플릿 목록 조회
export async function GET() {
  try {
    const db = getDb();
    const result = await db.select().from(templates);
    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: '템플릿 목록을 불러올 수 없습니다' } },
      { status: 500 },
    );
  }
}

// 템플릿 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, filePath } = body as {
      name: string;
      type: 'word' | 'ppt';
      filePath: string;
    };

    if (!name || !type || !filePath) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'name, type, filePath가 필요합니다' } },
        { status: 400 },
      );
    }

    const db = getDb();
    const [template] = await db.insert(templates).values({
      name,
      type,
      filePath,
      isDefault: false,
    }).returning();

    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_ERROR', message: '템플릿 등록에 실패했습니다' } },
      { status: 500 },
    );
  }
}
