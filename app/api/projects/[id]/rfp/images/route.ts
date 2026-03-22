import { NextRequest, NextResponse } from 'next/server';
import { imageMetadataRepository } from '@/lib/repositories/image-metadata.repository';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  try {
    const allImages = await imageMetadataRepository.findByProjectId(projectId);
    const images = allImages.map(img => ({
      id: img.id,
      pageNumber: img.pageNumber,
      imageType: img.imageType,
      width: img.width,
      height: img.height,
      description: img.description ?? '',
      keywords: img.keywords ?? [],
      filterStatus: img.filterStatus,
      filterReason: img.filterReason ?? '',
    }));

    return NextResponse.json({ success: true, data: images });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '이미지 조회에 실패했습니다' } },
      { status: 500 },
    );
  }
}
