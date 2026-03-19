import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import {
  projects, rfpFiles, rfpAnalyses, proposalDirections,
  proposalStrategies, proposalOutlines, proposalSections,
  reviewReports, priceProposals, templates,
} from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body?.version || !body?.data) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_FORMAT', message: '올바른 백업 파일이 아닙니다' } },
        { status: 400 },
      );
    }

    const { data } = body;
    const db = getDb();

    // 순서 중요: 참조 관계에 따라 자식 → 부모 순 삭제, 부모 → 자식 순 삽입
    await db.delete(proposalSections);
    await db.delete(reviewReports);
    await db.delete(priceProposals);
    await db.delete(proposalOutlines);
    await db.delete(proposalStrategies);
    await db.delete(proposalDirections);
    await db.delete(rfpAnalyses);
    await db.delete(rfpFiles);
    await db.delete(projects);
    await db.delete(templates);

    let imported = 0;

    if (data.projects?.length) {
      await db.insert(projects).values(data.projects);
      imported += data.projects.length;
    }
    if (data.rfpFiles?.length) {
      await db.insert(rfpFiles).values(data.rfpFiles);
      imported += data.rfpFiles.length;
    }
    if (data.rfpAnalyses?.length) {
      await db.insert(rfpAnalyses).values(data.rfpAnalyses);
      imported += data.rfpAnalyses.length;
    }
    if (data.directions?.length) {
      await db.insert(proposalDirections).values(data.directions);
      imported += data.directions.length;
    }
    if (data.strategies?.length) {
      await db.insert(proposalStrategies).values(data.strategies);
      imported += data.strategies.length;
    }
    if (data.outlines?.length) {
      await db.insert(proposalOutlines).values(data.outlines);
      imported += data.outlines.length;
    }
    if (data.sections?.length) {
      await db.insert(proposalSections).values(data.sections);
      imported += data.sections.length;
    }
    if (data.reviews?.length) {
      await db.insert(reviewReports).values(data.reviews);
      imported += data.reviews.length;
    }
    if (data.prices?.length) {
      await db.insert(priceProposals).values(data.prices);
      imported += data.prices.length;
    }
    if (data.templates?.length) {
      await db.insert(templates).values(data.templates);
      imported += data.templates.length;
    }

    return NextResponse.json({
      success: true,
      data: { imported, exportedAt: body.exportedAt },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'IMPORT_ERROR', message: '데이터 가져오기에 실패했습니다' } },
      { status: 500 },
    );
  }
}
