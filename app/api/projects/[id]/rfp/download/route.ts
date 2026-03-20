import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { handleApiError } from '@/lib/errors/api-handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;
    const rfpFile = await rfpRepository.getFileByProjectId(projectId);

    if (!rfpFile) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'RFP 파일을 찾을 수 없습니다' } },
        { status: 404 },
      );
    }

    const mimeType = rfpFile.fileType === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    const fileBuffer = await readFile(rfpFile.filePath);

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(rfpFile.fileName)}"`,
        'Content-Length': String(rfpFile.fileSize),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
