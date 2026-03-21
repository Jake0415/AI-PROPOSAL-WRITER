import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import {
  projects, rfpFiles, rfpAnalyses, proposalDirections,
  proposalStrategies, proposalOutlines, proposalSections,
  reviewReports, priceProposals, templates, profiles,
} from '@/lib/db/schema';
import { requireRole } from '@/lib/auth/with-auth';

export async function POST() {
  try {
    const auth = await requireRole('super_admin');
    if (auth instanceof NextResponse) return auth;
    const db = getDb();

    const [
      allProjects, allRfpFiles, allRfpAnalyses,
      allDirections, allStrategies, allOutlines,
      allSections, allReviews, allPrices,
      allTemplates, allProfiles,
    ] = await Promise.all([
      db.select().from(projects),
      db.select().from(rfpFiles),
      db.select().from(rfpAnalyses),
      db.select().from(proposalDirections),
      db.select().from(proposalStrategies),
      db.select().from(proposalOutlines),
      db.select().from(proposalSections),
      db.select().from(reviewReports),
      db.select().from(priceProposals),
      db.select().from(templates),
      db.select({
        id: profiles.id,
        loginId: profiles.loginId,
        name: profiles.name,
        role: profiles.role,
        department: profiles.department,
        phone: profiles.phone,
      }).from(profiles),
    ]);

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        profiles: allProfiles,
        projects: allProjects,
        rfpFiles: allRfpFiles,
        rfpAnalyses: allRfpAnalyses,
        directions: allDirections,
        strategies: allStrategies,
        outlines: allOutlines,
        sections: allSections,
        reviews: allReviews,
        prices: allPrices,
        templates: allTemplates,
      },
    };

    const json = JSON.stringify(exportData, null, 2);
    const filename = `backup_${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'EXPORT_ERROR', message: '데이터 내보내기에 실패했습니다' } },
      { status: 500 },
    );
  }
}
