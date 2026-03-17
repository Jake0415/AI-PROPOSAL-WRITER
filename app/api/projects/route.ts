import { NextRequest, NextResponse } from 'next/server';
import { initializeDb } from '@/lib/db/client';
import { projectRepository } from '@/lib/repositories/project.repository';
import { createProjectSchema } from '@/lib/validators/project.schema';

// DB 초기화 (최초 1회)
try {
  initializeDb();
} catch {
  // 이미 초기화됨
}

export async function GET() {
  try {
    const projects = await projectRepository.findAll();
    return NextResponse.json({ success: true, data: projects });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: '프로젝트 목록을 불러올 수 없습니다' } },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } },
        { status: 400 },
      );
    }

    const project = await projectRepository.create(parsed.data.title);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_ERROR', message: '프로젝트를 생성할 수 없습니다' } },
      { status: 500 },
    );
  }
}
