import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { uploadFile } from '@/lib/ai/client';

// POST - GPT에 PDF 파일 업로드 (벡터 등록)
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

    // 이미 등록된 경우 기존 file_id 반환
    if (rfpFile.gptFileId) {
      return NextResponse.json({
        success: true,
        data: { fileId: rfpFile.gptFileId, status: 'already_registered' },
      });
    }

    // 파일 읽기 + GPT 업로드
    const buffer = await readFile(rfpFile.filePath);
    const fileId = await uploadFile(buffer, rfpFile.fileName);

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: { code: 'UPLOAD_FAILED', message: 'GPT 파일 업로드에 실패했습니다. API 키를 확인하세요.' } },
        { status: 500 },
      );
    }

    // DB에 file_id 저장
    await rfpRepository.updateGptFileId(projectId, fileId);

    return NextResponse.json({
      success: true,
      data: { fileId, status: 'registered' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '벡터 등록에 실패했습니다';
    return NextResponse.json(
      { success: false, error: { code: 'VECTOR_ERROR', message } },
      { status: 500 },
    );
  }
}

// DELETE - 벡터 등록 해제 (재등록 시 사용)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  try {
    await rfpRepository.updateGptFileId(projectId, '');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '벡터 해제에 실패했습니다' } },
      { status: 500 },
    );
  }
}
