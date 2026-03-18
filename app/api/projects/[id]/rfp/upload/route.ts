import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { parseRfpFile } from '@/lib/services/rfp-parser.service';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { projectRepository } from '@/lib/repositories/project.repository';
import {
  sanitizeFileName,
  isAllowedMimeType,
  isAllowedFileSize,
} from '@/lib/security/sanitize';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  try {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '프로젝트를 찾을 수 없습니다' } },
        { status: 404 },
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_FILE', message: '파일이 없습니다' } },
        { status: 400 },
      );
    }

    // 파일 크기 검증
    if (!isAllowedFileSize(file.size, MAX_FILE_SIZE)) {
      return NextResponse.json(
        { success: false, error: { code: 'FILE_TOO_LARGE', message: '파일 크기는 50MB 이하여야 합니다' } },
        { status: 400 },
      );
    }

    // MIME 타입 검증
    if (!isAllowedMimeType(file.type, ['pdf', 'docx'])) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_MIME', message: 'PDF 또는 DOCX 파일만 지원합니다' } },
        { status: 400 },
      );
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TYPE', message: 'PDF 또는 DOCX 파일만 지원합니다' } },
        { status: 400 },
      );
    }

    const fileType = ext as 'pdf' | 'docx';
    const buffer = Buffer.from(await file.arrayBuffer());
    // 파일명 새니타이징
    const safeName = sanitizeFileName(file.name);

    // 파일 저장
    const uploadDir = path.join(process.cwd(), 'data', 'uploads', projectId);
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, safeName);
    await writeFile(filePath, buffer);

    // 텍스트 추출
    const parsed = await parseRfpFile(buffer, fileType);

    // DB 저장
    const rfpFile = await rfpRepository.createFile({
      projectId,
      fileName: safeName,
      fileType,
      filePath,
      fileSize: file.size,
      rawText: parsed.text,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: rfpFile.id,
        fileName: rfpFile.fileName,
        fileSize: rfpFile.fileSize,
        textLength: parsed.text.length,
        pageCount: parsed.pageCount,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UPLOAD_ERROR', message: 'RFP 파일 업로드에 실패했습니다' } },
      { status: 500 },
    );
  }
}
