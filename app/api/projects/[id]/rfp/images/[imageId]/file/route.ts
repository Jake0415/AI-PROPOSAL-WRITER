import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { imageMetadataRepository } from '@/lib/repositories/image-metadata.repository';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const { id: projectId, imageId } = await params;

  try {
    const allImages = await imageMetadataRepository.findByProjectId(projectId);
    const image = allImages.find(img => img.id === imageId);

    if (!image) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '이미지를 찾을 수 없습니다' } },
        { status: 404 },
      );
    }

    const buffer = await readFile(image.imagePath);
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '이미지 파일을 불러올 수 없습니다' } },
      { status: 500 },
    );
  }
}
