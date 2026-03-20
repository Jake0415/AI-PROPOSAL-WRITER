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
  validateMagicBytes,
} from '@/lib/security/sanitize';
import { handleApiError } from '@/lib/errors/api-handler';

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

    // Magic bytes 검증 (MIME 위조 방지)
    if (!validateMagicBytes(buffer, fileType)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_FILE', message: '파일 내용이 확장자와 일치하지 않습니다' } },
        { status: 400 },
      );
    }

    // 파일명 새니타이징
    const safeName = sanitizeFileName(file.name);

    // 텍스트 추출
    const parsed = await parseRfpFile(buffer, fileType);

    // 파일시스템에 저장
    const uploadDir = path.join(process.cwd(), 'data', 'uploads', projectId);
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, safeName);
    await writeFile(filePath, buffer);

    // DB에 메타데이터 + 텍스트 저장
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
  } catch (err) {
    return handleApiError(err);
  }
}

// GET - RFP 파일 정보 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;
  try {
    const rfpFile = await rfpRepository.getFileByProjectId(projectId);
    if (!rfpFile) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: '파일 없음' } }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: {
        fileName: rfpFile.fileName,
        fileSize: rfpFile.fileSize,
        gptFileId: rfpFile.gptFileId ?? null,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: '파일 정보 조회 실패' } }, { status: 500 });
  }
}
