import { NextRequest, NextResponse } from 'next/server';
import { scrollPoints, getCollectionName } from '@/lib/vector/qdrant-client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  try {
    const collectionName = getCollectionName(projectId);
    const points = await scrollPoints(collectionName, {
      must: [{ key: 'type', match: { value: 'text' } }],
    });

    const chunks = points
      .map(p => ({
        id: p.id,
        text: (p.payload?.text as string) ?? '',
        pageNumber: (p.payload?.pageNumber as number) ?? 0,
        chunkIndex: (p.payload?.chunkIndex as number) ?? 0,
      }))
      .sort((a, b) => a.chunkIndex - b.chunkIndex);

    return NextResponse.json({ success: true, data: chunks });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '청크 조회에 실패했습니다' } },
      { status: 500 },
    );
  }
}
