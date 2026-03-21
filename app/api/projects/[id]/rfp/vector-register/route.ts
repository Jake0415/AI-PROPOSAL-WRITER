import { NextRequest, NextResponse } from 'next/server';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { registerVectors } from '@/lib/vector/rag.service';

// POST - Qdrant 벡터 등록 (텍스트 + 이미지)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  try {
    const rfpFile = await rfpRepository.getFileByProjectId(projectId);
    if (!rfpFile) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'RFP 파일이 없습니다. 먼저 파일을 업로드하세요.' } },
        { status: 404 },
      );
    }

    if (rfpFile.vectorStatus === 'completed') {
      return NextResponse.json({
        success: true,
        data: { status: 'already_registered' },
      });
    }

    await rfpRepository.updateVectorStatus(projectId, 'processing');

    const result = await registerVectors(
      projectId,
      rfpFile.rawText,
      rfpFile.filePath,
    );

    await rfpRepository.updateVectorStatus(projectId, 'completed');

    return NextResponse.json({
      success: true,
      data: {
        status: 'registered',
        chunkCount: result.chunkCount,
        pageCount: result.pageCount,
      },
    });
  } catch (err) {
    await rfpRepository.updateVectorStatus(projectId, 'failed').catch(() => {});
    const message = err instanceof Error ? err.message : '벡터 등록에 실패했습니다';
    return NextResponse.json(
      { success: false, error: { code: 'VECTOR_ERROR', message } },
      { status: 500 },
    );
  }
}

// DELETE - 벡터 등록 해제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  try {
    const { deleteCollection, getCollectionName } = await import('@/lib/vector/qdrant-client');
    await deleteCollection(getCollectionName(projectId));
    await rfpRepository.updateVectorStatus(projectId, 'none');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '벡터 해제에 실패했습니다' } },
      { status: 500 },
    );
  }
}
