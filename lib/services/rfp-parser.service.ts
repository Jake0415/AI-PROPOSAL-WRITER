import { writeFile, readFile, rm, mkdir } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { randomUUID } from 'crypto';
import mammoth from 'mammoth';

export interface ParseResult {
  text: string;
  pageCount?: number;
  imagePages?: number[];
}

/**
 * @opendataloader/pdf로 PDF → 마크다운 변환 (표 구조 보존)
 * Java 11+ 필요. 미설치 시 pdf-parse로 폴백.
 */
export async function parsePdf(buffer: Buffer): Promise<ParseResult> {
  try {
    return await parsePdfWithOpenDataLoader(buffer);
  } catch (err) {
    console.warn('⚠️ @opendataloader/pdf 실패, pdf-parse로 폴백:', (err as Error).message);
    return parsePdfWithFallback(buffer);
  }
}

async function parsePdfWithOpenDataLoader(buffer: Buffer): Promise<ParseResult> {
  const { convert } = await import('@opendataloader/pdf');

  const tempId = randomUUID();
  const tempDir = path.join(tmpdir(), `odl-${tempId}`);
  const tempFile = path.join(tempDir, 'input.pdf');
  const outputDir = path.join(tempDir, 'output');

  try {
    await mkdir(tempDir, { recursive: true });
    await mkdir(outputDir, { recursive: true });
    await writeFile(tempFile, buffer);

    await convert([tempFile], {
      outputDir,
      format: 'markdown,json',
    });

    // 마크다운 파일 읽기 (표 구조 보존)
    let text = '';
    try {
      const mdPath = path.join(outputDir, 'input.md');
      text = await readFile(mdPath, 'utf-8');
    } catch {
      // 파일명이 다를 수 있으므로 디렉토리 검색
      const { readdir } = await import('fs/promises');
      const files = await readdir(outputDir);
      const mdFile = files.find(f => f.endsWith('.md'));
      if (mdFile) {
        text = await readFile(path.join(outputDir, mdFile), 'utf-8');
      }
    }

    if (!text) {
      throw new Error('마크다운 출력 파일을 찾을 수 없습니다');
    }

    // JSON 메타데이터에서 imagePages + pageCount 추출
    let pageCount: number | undefined;
    const imagePages: number[] = [];

    try {
      const files = (await import('fs/promises')).readdir;
      const dirFiles = await (await import('fs/promises')).readdir(outputDir);
      const jsonFile = dirFiles.find(f => f.endsWith('.json'));
      if (jsonFile) {
        const jsonContent = await readFile(path.join(outputDir, jsonFile), 'utf-8');
        const elements = JSON.parse(jsonContent);
        if (Array.isArray(elements)) {
          const pages = new Set<number>();
          const imgPages = new Set<number>();
          for (const el of elements) {
            if (el.page) pages.add(el.page);
            if (el.type === 'figure' || el.type === 'image' || el.type === 'picture') {
              if (el.page) imgPages.add(el.page);
            }
          }
          pageCount = pages.size;
          imagePages.push(...Array.from(imgPages).sort((a, b) => a - b));
        }
      }
    } catch { /* JSON 파싱 실패 시 무시 */ }

    return { text, pageCount, imagePages };
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

/** pdf-parse 폴백 (Java 미설치 시) */
async function parsePdfWithFallback(buffer: Buffer): Promise<ParseResult> {
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const info = await parser.getInfo();
  const textResult = await parser.getText();
  await parser.destroy();
  return {
    text: textResult.text,
    pageCount: info.total,
    imagePages: [],
  };
}

export async function parseDocx(buffer: Buffer): Promise<ParseResult> {
  const result = await mammoth.extractRawText({ buffer });
  return {
    text: result.value,
    imagePages: [],
  };
}

export async function parseRfpFile(
  buffer: Buffer,
  fileType: 'pdf' | 'docx',
): Promise<ParseResult> {
  if (fileType === 'pdf') {
    return parsePdf(buffer);
  }
  return parseDocx(buffer);
}
