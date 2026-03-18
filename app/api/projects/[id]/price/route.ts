import { NextRequest, NextResponse } from 'next/server';
import { priceRepository } from '@/lib/repositories/price.repository';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  try {
    const price = await priceRepository.getByProjectId(projectId);
    if (!price) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: {
        laborCosts: JSON.parse(price.laborCosts),
        equipmentCosts: JSON.parse(price.equipmentCosts),
        expenseCosts: JSON.parse(price.expenseCosts),
        indirectCosts: JSON.parse(price.indirectCosts),
        summary: JSON.parse(price.summary),
        competitiveness: JSON.parse(price.competitiveness),
        generatedAt: price.generatedAt,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '가격 데이터 조회에 실패했습니다';
    return NextResponse.json(
      { success: false, error: { code: 'PRICE_FETCH_ERROR', message } },
      { status: 500 },
    );
  }
}
