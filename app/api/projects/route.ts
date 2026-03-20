import { NextRequest, NextResponse } from 'next/server';
import { projectRepository } from '@/lib/repositories/project.repository';
import { createProjectSchema, projectFilterSchema } from '@/lib/validators/project.schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const filterInput = {
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    };

    const parsed = projectFilterSchema.safeParse(filterInput);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } },
        { status: 400 },
      );
    }

    const result = await projectRepository.findAllWithDetails(parsed.data);
    return NextResponse.json({ success: true, data: result.data, meta: result.meta });
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
