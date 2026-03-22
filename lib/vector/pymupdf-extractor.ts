import { execFile } from 'child_process';
import path from 'path';
import { mkdir } from 'fs/promises';

export interface ExtractedImage {
  page: number;
  index: number;
  width: number;
  height: number;
  path: string;
  filename: string;
  type: 'element' | 'page_render';
}

interface ExtractionResult {
  element_images: ExtractedImage[];
  page_renders: ExtractedImage[];
  total: number;
}

const TIMEOUT_MS = 120_000;

/**
 * 하이브리드 이미지 추출:
 * 1차: PyMuPDF get_images() - 임베딩된 이미지 객체
 * 2차: get_pixmap() - imagePages의 벡터 도표를 페이지 렌더링
 */
export async function extractImagesWithPyMuPDF(
  pdfPath: string,
  projectId: string,
  imagePages?: number[],
): Promise<ExtractedImage[]> {
  const outputDir = path.join(process.cwd(), 'data', 'uploads', projectId, 'images');
  await mkdir(outputDir, { recursive: true });

  const scriptPath = path.join(process.cwd(), 'scripts', 'extract-images.py');

  const args = [scriptPath, pdfPath, outputDir];
  if (imagePages && imagePages.length > 0) {
    args.push('--image-pages', imagePages.join(','));
  }

  return new Promise((resolve) => {
    execFile(
      'python3',
      args,
      { timeout: TIMEOUT_MS, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout) => {
        if (error) {
          const msg = error.message ?? '';
          if (!msg.includes('ENOENT') && !msg.includes('not found')) {
            console.warn('PyMuPDF extraction failed:', msg);
          }
          resolve([]);
          return;
        }

        try {
          const result: ExtractionResult = JSON.parse(stdout.trim());
          const allImages = [
            ...(result.element_images ?? []),
            ...(result.page_renders ?? []),
          ];
          resolve(allImages);
        } catch {
          resolve([]);
        }
      },
    );
  });
}
