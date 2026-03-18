import { NextResponse } from 'next/server';
import { projectRepository } from '@/lib/repositories/project.repository';

export async function GET() {
  try {
    const projects = await projectRepository.findAll();

    // 상태별 집계
    const projectsByStatus: Record<string, number> = {};
    for (const project of projects) {
      projectsByStatus[project.status] =
        (projectsByStatus[project.status] ?? 0) + 1;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalProjects: projects.length,
        projectsByStatus,
        recentProjects: projects.slice(0, 10),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'STATS_ERROR', message: '통계를 불러올 수 없습니다' } },
      { status: 500 },
    );
  }
}
