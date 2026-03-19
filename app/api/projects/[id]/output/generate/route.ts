import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import { projectRepository } from '@/lib/repositories/project.repository';
import {
  generateWordDocument,
  generatePptDocument,
} from '@/lib/services/document-generator.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  let body: { type?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_BODY', message: '요청 본문이 올바르지 않습니다' } },
      { status: 400 },
    );
  }

  const docType = body.type as 'word' | 'ppt';
  if (!docType || !['word', 'ppt'].includes(docType)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_TYPE', message: 'type은 "word" 또는 "ppt"이어야 합니다' } },
      { status: 400 },
    );
  }

  try {
    // 데이터 로드
    const [analysis, strategy, outline, sections] = await Promise.all([
      rfpRepository.getAnalysisByProjectId(projectId),
      proposalRepository.getStrategy(projectId),
      proposalRepository.getOutline(projectId),
      proposalRepository.getSectionsByProject(projectId),
    ]);

    if (!analysis || !outline || sections.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_DATA', message: '분석, 목차, 섹션 데이터가 필요합니다' } },
        { status: 400 },
      );
    }

    const overview = analysis.overview;
    const outlineSections = outline.sections;

    const proposalData = {
      projectName: overview.projectName ?? '제안서',
      client: overview.client ?? '',
      overview: overview.summary ?? '',
      competitiveStrategy: strategy?.competitiveStrategy ?? '',
      keyMessages: strategy ? strategy.keyMessages : [],
      outlineSections,
      sections: sections.map((s) => ({
        sectionPath: s.sectionPath,
        title: s.title,
        content: s.content,
        diagrams: s.diagrams,
      })),
    };

    // 문서 생성
    let buffer: Buffer;
    let fileName: string;
    let contentType: string;

    if (docType === 'word') {
      buffer = await generateWordDocument(proposalData);
      fileName = `${proposalData.projectName}_제안서.docx`;
      contentType =
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else {
      buffer = await generatePptDocument(proposalData);
      fileName = `${proposalData.projectName}_제안서.pptx`;
      contentType =
        'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    }

    // 파일 로컬 저장
    const outputDir = join(process.cwd(), 'data', 'outputs', projectId);
    await mkdir(outputDir, { recursive: true });
    const filePath = join(outputDir, fileName);
    await writeFile(filePath, buffer);

    // DB에 산출물 기록
    await proposalRepository.createOutput({
      projectId,
      type: docType,
      templateId: null,
      filePath,
      fileName,
    });

    // 프로젝트 상태 업데이트
    await projectRepository.updateStatus(projectId, 'completed');

    // 파일 직접 응답 (다운로드)
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '문서 생성에 실패했습니다';
    return NextResponse.json(
      { success: false, error: { code: 'GENERATION_ERROR', message } },
      { status: 500 },
    );
  }
}
