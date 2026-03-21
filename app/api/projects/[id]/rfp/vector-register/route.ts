import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { projectRepository } from '@/lib/repositories/project.repository';
import { registerVectors } from '@/lib/vector/rag.service';
import { createSSEResponse } from '@/lib/utils/sse-stream';

/** Docker 절대 경로(/app/...)를 현재 cwd 기준으로 보정 */
function resolveFilePath(filePath: string): string {
  if (filePath.startsWith('/app/')) {
    return path.join(process.cwd(), filePath.replace(/^\/app\//, ''));
  }
  return filePath;
}

// POST - Qdrant 벡터 등록 (SSE 스트리밍)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

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

  return createSSEResponse(
    async (onProgress) => {
      try {
        const result = await registerVectors(
          projectId,
          rfpFile.rawText,
          resolveFilePath(rfpFile.filePath),
          onProgress,
          rfpFile.imagePages ?? [],
        );
        await rfpRepository.updateVectorStatus(projectId, 'completed');
        await projectRepository.updateStatus(projectId, 'vectorized');
        return result;
      } catch (err) {
        await rfpRepository.updateVectorStatus(projectId, 'failed').catch(() => {});
        throw err;
      }
    },
    'VECTOR_ERROR',
    '벡터 생성에 실패했습니다',
  );
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
