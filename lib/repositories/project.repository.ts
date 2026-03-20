import { eq, desc, ilike, and, count } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { projects } from '@/lib/db/schema';
import type { ProjectStatus } from '@/lib/db/schema';
import type { ProjectFilterInput } from '@/lib/validators/project.schema';

export const projectRepository = {
  async findAll() {
    const db = getDb();
    return db.select().from(projects).orderBy(desc(projects.createdAt));
  },

  async findAllWithDetails(filters?: ProjectFilterInput) {
    const db = getDb();
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const offset = (page - 1) * limit;

    // 필터 조건 구성
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(projects.status, filters.status as ProjectStatus));
    }
    if (filters?.search) {
      conditions.push(ilike(projects.title, `%${filters.search}%`));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 전체 개수 조회
    const [totalResult] = await db
      .select({ count: count() })
      .from(projects)
      .where(whereClause);
    const total = totalResult?.count ?? 0;

    // 프로젝트 + 멤버(프로필 포함) + RFP 분석 조회
    const result = await db.query.projects.findMany({
      where: whereClause,
      orderBy: [desc(projects.createdAt)],
      limit,
      offset,
      with: {
        members: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                department: true,
                avatarUrl: true,
              },
            },
          },
        },
        rfpAnalyses: {
          columns: {
            overview: true,
          },
          limit: 1,
        },
      },
    });

    // rfpAnalyses 배열에서 overview만 추출하여 평탄화
    const data = result.map((project) => {
      const analysis = project.rfpAnalyses[0];
      return {
        ...project,
        rfpAnalysis: analysis?.overview ?? null,
        rfpAnalyses: undefined,
      };
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string) {
    const db = getDb();
    const results = await db.select().from(projects).where(eq(projects.id, id));
    return results[0];
  },

  async create(title: string) {
    const db = getDb();
    const [project] = await db.insert(projects).values({
      title,
      status: 'uploaded' as ProjectStatus,
    }).returning();
    return project;
  },

  async updateStatus(id: string, status: ProjectStatus): Promise<void> {
    const db = getDb();
    await db
      .update(projects)
      .set({ status, updatedAt: new Date() })
      .where(eq(projects.id, id));
  },

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.delete(projects).where(eq(projects.id, id));
  },
};
