import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getDb } from '@/lib/db/client';
import { templates } from '@/lib/db/schema';
import { sanitizeFileName } from '@/lib/security/sanitize';

const ALLOWED_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_FILE', message: '파일을 선택해주세요' } },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: { code: 'TOO_LARGE', message: '파일 크기는 20MB 이하여야 합니다' } },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TYPE', message: 'Word(.docx) 또는 PPT(.pptx) 파일만 지원합니다' } },
        { status: 400 },
      );
    }

    const ext = file.name.endsWith('.pptx') ? '.pptx' : '.docx';
    const type = ext === '.pptx' ? 'ppt' : 'word';
    const safeName = sanitizeFileName(file.name);

    const dir = path.join(process.cwd(), 'data', 'templates');
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, safeName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const db = getDb();
    const [template] = await db.insert(templates).values({
      name: safeName.replace(ext, ''),
      type: type as 'word' | 'ppt',
      filePath,
      isDefault: false,
    }).returning();

    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UPLOAD_ERROR', message: '템플릿 업로드에 실패했습니다' } },
      { status: 500 },
    );
  }
}
