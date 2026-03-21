import { mkdir } from 'fs/promises';
import path from 'path';

interface PageImage {
  pageNumber: number;
  imagePath: string;
}

/**
 * PDF를 페이지별 PNG 이미지로 변환
 * graphicsmagick + ghostscript 필요 (Docker에서 apk add)
 */
export async function convertPdfToImages(
  pdfPath: string,
  outputDir: string,
): Promise<PageImage[]> {
  await mkdir(outputDir, { recursive: true });

  try {
    // pdf2pic은 동적 import (Node.js ESM 호환)
    const { fromPath } = await import('pdf2pic');

    const converter = fromPath(pdfPath, {
      density: 150,
      saveFilename: 'page',
      savePath: outputDir,
      format: 'png',
      width: 1200,
      height: 1600,
    });

    // 전체 페이지 변환
    const results = await converter.bulk(-1, { responseType: 'image' });

    return results
      .filter(r => r.path)
      .map((r, i) => ({
        pageNumber: i + 1,
        imagePath: r.path!,
      }));
  } catch (err) {
    // graphicsmagick 미설치 시 빈 배열 반환 (텍스트 RAG만 사용)
    const message = err instanceof Error ? err.message : '';
    if (message.includes('GraphicsMagick') || message.includes('gm')) {
      return [];
    }
    throw err;
  }
}

/**
 * 이미지 파일을 base64로 변환 (GPT Vision용)
 */
export async function imageToBase64(imagePath: string): Promise<string> {
  const { readFile } = await import('fs/promises');
  const buffer = await readFile(imagePath);
  return buffer.toString('base64');
}

/**
 * 프로젝트의 페이지 이미지 디렉토리 경로
 */
export function getPageImagesDir(projectId: string): string {
  return path.join(process.cwd(), 'data', 'uploads', projectId, 'pages');
}
