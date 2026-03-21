import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db/client';
import { requireRole } from '@/lib/auth/with-auth';
import {
  projects, rfpFiles, rfpAnalyses, proposalDirections,
  proposalStrategies, proposalOutlines, proposalSections,
  reviewReports, priceProposals, templates,
} from '@/lib/db/schema';

// ─── Zod 스키마: Import 데이터 검증 ─────────────────────────

const uuidSchema = z.string().uuid();
const dateSchema = z.coerce.date();

const projectSchema = z.object({
  id: uuidSchema,
  title: z.string().min(1).max(500),
  status: z.enum(['uploaded', 'vectorized', 'analyzing', 'direction_set', 'strategy_set', 'outline_ready', 'generating', 'sections_ready', 'reviewing', 'completed']),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

const rfpFileSchema = z.object({
  id: uuidSchema,
  projectId: uuidSchema,
  fileName: z.string().min(1).max(500),
  fileType: z.enum(['pdf', 'docx']),
  filePath: z.string().min(1),
  fileSize: z.number().int().nonnegative(),
  rawText: z.string().default(''),
  gptFileId: z.string().nullable().optional(),
  imagePages: z.array(z.number().int().nonnegative()).default([]),
  vectorStatus: z.enum(['none', 'processing', 'completed', 'failed']).default('none'),
  uploadedAt: dateSchema,
});

const rfpAnalysisSchema = z.object({
  id: uuidSchema,
  projectId: uuidSchema,
  overview: z.any().default({}),
  requirements: z.array(z.any()).default([]),
  evaluationCriteria: z.array(z.any()).default([]),
  evaluationItems: z.array(z.any()).default([]),
  traceabilityMatrix: z.array(z.any()).default([]),
  qualifications: z.array(z.any()).default([]),
  strategyPoints: z.array(z.any()).default([]),
  recommendedChapters: z.array(z.any()).default([]),
  scope: z.any().default({}),
  constraints: z.any().default({}),
  keywords: z.array(z.string()).default([]),
  analyzedAt: dateSchema,
});

const directionSchema = z.object({
  id: uuidSchema,
  projectId: uuidSchema,
  candidates: z.array(z.any()).default([]),
  selectedIndex: z.number().int().nullable().optional(),
  customNotes: z.string().nullable().optional(),
  confirmedAt: dateSchema.nullable().optional(),
});

const strategySchema = z.object({
  id: uuidSchema,
  projectId: uuidSchema,
  competitiveStrategy: z.string().default(''),
  differentiators: z.array(z.any()).default([]),
  keyMessages: z.array(z.string()).default([]),
  writingStyle: z.string().default('formal'),
  customNotes: z.string().nullable().optional(),
  confirmedAt: dateSchema.nullable().optional(),
});

const outlineSchema = z.object({
  id: uuidSchema,
  projectId: uuidSchema,
  sections: z.array(z.any()).default([]),
});

const sectionSchema = z.object({
  id: uuidSchema,
  projectId: uuidSchema,
  outlineId: uuidSchema,
  sectionPath: z.string().min(1),
  title: z.string().min(1),
  content: z.string().default(''),
  diagrams: z.array(z.any()).default([]),
  status: z.enum(['pending', 'generating', 'generated', 'edited']).default('pending'),
  linkedReqIds: z.array(z.string()).default([]),
  generatedAt: dateSchema.nullable().optional(),
  editedAt: dateSchema.nullable().optional(),
});

const reviewSchema = z.object({
  id: uuidSchema,
  projectId: uuidSchema,
  overallScore: z.number().int().nonnegative().default(0),
  totalPossible: z.number().int().nonnegative().default(100),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']).default('F'),
  evalCoverage: z.number().int().nonnegative().default(0),
  reqCoverage: z.number().int().nonnegative().default(0),
  formatCompliance: z.number().int().nonnegative().default(0),
  evalResults: z.array(z.any()).default([]),
  reqResults: z.array(z.any()).default([]),
  improvements: z.array(z.any()).default([]),
  summary: z.string().default(''),
  generatedAt: dateSchema,
});

const priceSchema = z.object({
  id: uuidSchema,
  projectId: uuidSchema,
  laborCosts: z.array(z.any()).default([]),
  equipmentCosts: z.array(z.any()).default([]),
  expenseCosts: z.array(z.any()).default([]),
  indirectCosts: z.any().default({}),
  summary: z.any().default({}),
  competitiveness: z.any().default({}),
  generatedAt: dateSchema,
});

const templateSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(500),
  type: z.enum(['word', 'ppt']),
  filePath: z.string().min(1),
  isDefault: z.boolean().default(false),
  uploadedAt: dateSchema,
});

const importBodySchema = z.object({
  version: z.string().min(1),
  exportedAt: z.string().optional(),
  data: z.object({
    projects: z.array(projectSchema).default([]),
    rfpFiles: z.array(rfpFileSchema).default([]),
    rfpAnalyses: z.array(rfpAnalysisSchema).default([]),
    directions: z.array(directionSchema).default([]),
    strategies: z.array(strategySchema).default([]),
    outlines: z.array(outlineSchema).default([]),
    sections: z.array(sectionSchema).default([]),
    reviews: z.array(reviewSchema).default([]),
    prices: z.array(priceSchema).default([]),
    templates: z.array(templateSchema).default([]),
  }),
});

// ─── Import API ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole('super_admin');
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();

    // Zod 스키마로 입력 검증
    const parsed = importBodySchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `데이터 검증 실패: ${firstError?.path.join('.')} - ${firstError?.message}`,
          },
        },
        { status: 400 },
      );
    }

    const { data } = parsed.data;
    const db = getDb();

    // 트랜잭션으로 전체 작업을 원자적으로 처리
    const imported = await db.transaction(async (tx) => {
      // 순서 중요: 참조 관계에 따라 자식 → 부모 순 삭제
      await tx.delete(proposalSections);
      await tx.delete(reviewReports);
      await tx.delete(priceProposals);
      await tx.delete(proposalOutlines);
      await tx.delete(proposalStrategies);
      await tx.delete(proposalDirections);
      await tx.delete(rfpAnalyses);
      await tx.delete(rfpFiles);
      await tx.delete(projects);
      await tx.delete(templates);

      let count = 0;

      // 부모 → 자식 순 삽입 (Zod 검증 완료된 데이터를 Drizzle에 전달)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const insert = async (table: Parameters<typeof tx.insert>[0], values: unknown[]) => {
        if (values.length) {
          await tx.insert(table).values(values as never);
        }
        return values.length;
      };

      count += await insert(projects, data.projects);
      count += await insert(rfpFiles, data.rfpFiles);
      count += await insert(rfpAnalyses, data.rfpAnalyses);
      count += await insert(proposalDirections, data.directions);
      count += await insert(proposalStrategies, data.strategies);
      count += await insert(proposalOutlines, data.outlines);
      count += await insert(proposalSections, data.sections);
      count += await insert(reviewReports, data.reviews);
      count += await insert(priceProposals, data.prices);
      count += await insert(templates, data.templates);

      return count;
    });

    return NextResponse.json({
      success: true,
      data: { imported, exportedAt: parsed.data.exportedAt },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'IMPORT_ERROR', message: '데이터 가져오기에 실패했습니다' } },
      { status: 500 },
    );
  }
}
