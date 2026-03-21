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
}

interface ExtractionResult {
  images: ExtractedImage[];
  count: number;
}

const TIMEOUT_MS = 120_000; // 2분

/**
 * PyMuPDF(Python)로 PDF에서 개별 이미지를 추출
 * Python 미설치 시 graceful 폴백 (빈 배열 반환)
 */
export async function extractImagesWithPyMuPDF(
  pdfPath: string,
  projectId: string,
): Promise<ExtractedImage[]> {
  const outputDir = path.join(process.cwd(), 'data', 'uploads', projectId, 'images');
  await mkdir(outputDir, { recursive: true });

  const scriptPath = path.join(process.cwd(), 'scripts', 'extract-images.py');

  return new Promise((resolve) => {
    execFile(
      'python3',
      [scriptPath, pdfPath, outputDir],
      { timeout: TIMEOUT_MS, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout) => {
        if (error) {
          // Python 미설치 또는 스크립트 에러 시 폴백
          const msg = error.message ?? '';
          if (msg.includes('ENOENT') || msg.includes('not found')) {
            // Python 미설치 — 정상적인 폴백
          } else {
            console.warn('PyMuPDF extraction failed:', msg);
          }
          resolve([]);
          return;
        }

        try {
          const result: ExtractionResult = JSON.parse(stdout.trim());
          resolve(result.images ?? []);
        } catch {
          resolve([]);
        }
      },
    );
  });
}
