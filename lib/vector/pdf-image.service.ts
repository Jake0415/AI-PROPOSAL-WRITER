import { mkdir } from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';
import { DEFAULT_GPT_MODEL, isGpt5Model } from '@/lib/ai/models';

export interface PageImage {
  pageNumber: number;
  imagePath: string;
}

export interface ImageMetadata {
  description: string;
  keywords: string[];
  pageNumber: number;
  imagePath: string;
}

const MAX_IMAGE_PAGES = 20;
const VISION_CONCURRENCY = 3;

/**
 * PDF 전체 페이지를 PNG 이미지로 변환
 */
export async function convertPdfToImages(
  pdfPath: string,
  outputDir: string,
): Promise<PageImage[]> {
  await mkdir(outputDir, { recursive: true });

  try {
    const { fromPath } = await import('pdf2pic');
    const converter = fromPath(pdfPath, {
      density: 150,
      saveFilename: 'page',
      savePath: outputDir,
      format: 'png',
      width: 1200,
      height: 1600,
    });

    const results = await converter.bulk(-1, { responseType: 'image' });
    return results
      .filter(r => r.path)
      .map((r, i) => ({ pageNumber: i + 1, imagePath: r.path! }));
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('GraphicsMagick') || message.includes('gm')) {
      return [];
    }
    throw err;
  }
}

/**
 * 특정 페이지만 PNG 변환 (이미지/도표가 있는 페이지만)
 */
export async function convertSelectivePdfToImages(
  pdfPath: string,
  outputDir: string,
  pageNumbers: number[],
): Promise<PageImage[]> {
  if (pageNumbers.length === 0) return [];

  await mkdir(outputDir, { recursive: true });
  const pages = pageNumbers.slice(0, MAX_IMAGE_PAGES);

  try {
    const { fromPath } = await import('pdf2pic');
    const converter = fromPath(pdfPath, {
      density: 150,
      saveFilename: 'page',
      savePath: outputDir,
      format: 'png',
      width: 1200,
      height: 1600,
    });

    const results: PageImage[] = [];
    for (const pageNum of pages) {
      try {
        const result = await converter(pageNum, { responseType: 'image' });
        if (result.path) {
          results.push({ pageNumber: pageNum, imagePath: result.path });
        }
      } catch { /* 개별 페이지 실패 무시 */ }
    }
    return results;
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('GraphicsMagick') || message.includes('gm')) {
      return [];
    }
    throw err;
  }
}

/**
 * GPT Vision으로 이미지 설명 + 키워드 생성
 */
export async function generateImageMetadata(
  imagePath: string,
  pageNumber: number,
): Promise<ImageMetadata> {
  const base64 = await imageToBase64(imagePath);
  const { getApiKey } = await import('@/lib/ai/client');
  const apiKey = await getApiKey('gpt');
  const client = new OpenAI({ apiKey });

  const model = process.env.AI_MODEL_GPT ?? DEFAULT_GPT_MODEL;
  const response = await client.chat.completions.create({
    model,
    ...(isGpt5Model(model) ? { max_completion_tokens: 500 } : { max_tokens: 500 }),
    response_format: { type: 'json_object' },
    messages: [{
      role: 'user',
      content: [
        {
          type: 'text',
          text: '이 이미지는 RFP(제안요청서) 문서의 일부입니다. 이미지에 포함된 도표, 차트, 다이어그램, 표 등의 내용을 분석하세요. 반드시 JSON 형식으로 응답하세요: {"description": "이미지의 상세 설명 (한국어)", "keywords": ["키워드1", "키워드2", ...]}',
        },
        {
          type: 'image_url',
          image_url: { url: `data:image/png;base64,${base64}`, detail: 'low' },
        },
      ],
    }],
  });

  try {
    const content = response.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(content);
    return {
      description: parsed.description ?? '설명 없음',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      pageNumber,
      imagePath,
    };
  } catch {
    return {
      description: '이미지 분석 실패',
      keywords: [],
      pageNumber,
      imagePath,
    };
  }
}

/**
 * 여러 이미지의 메타데이터를 병렬 생성 (동시 3개)
 */
export async function generateBatchImageMetadata(
  pageImages: PageImage[],
  onProgress?: (completed: number, total: number) => void,
): Promise<ImageMetadata[]> {
  const results: ImageMetadata[] = [];
  const total = pageImages.length;

  for (let i = 0; i < total; i += VISION_CONCURRENCY) {
    const batch = pageImages.slice(i, i + VISION_CONCURRENCY);
    const batchResults = await Promise.allSettled(
      batch.map(img => generateImageMetadata(img.imagePath, img.pageNumber)),
    );

    for (const r of batchResults) {
      if (r.status === 'fulfilled') results.push(r.value);
    }
    onProgress?.(Math.min(i + VISION_CONCURRENCY, total), total);
  }

  return results;
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
 * UUID 형식 검증 (Path Traversal 방어)
 */
function validateUUID(id: string): void {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error('Invalid project ID format');
  }
}

/**
 * 프로젝트의 페이지 이미지 디렉토리 경로
 */
export function getPageImagesDir(projectId: string): string {
  validateUUID(projectId);
  return path.join(process.cwd(), 'data', 'uploads', projectId, 'pages');
}
