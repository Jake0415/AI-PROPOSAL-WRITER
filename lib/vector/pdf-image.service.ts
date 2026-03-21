import { readFile } from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';
import { DEFAULT_GPT_MODEL, isGpt5Model } from '@/lib/ai/models';

export interface ImageMetadata {
  description: string;
  keywords: string[];
  pageNumber: number;
  imagePath: string;
}

const MAX_ONDEMAND_IMAGES = 3;

/**
 * 이미지 파일을 base64로 변환
 */
export async function imageToBase64(imagePath: string): Promise<string> {
  const buffer = await readFile(imagePath);
  return buffer.toString('base64');
}

/**
 * 프로젝트의 이미지 디렉토리 경로 (PyMuPDF 추출 이미지)
 */
export function getPageImagesDir(projectId: string): string {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId)) {
    throw new Error('Invalid project ID format');
  }
  return path.join(process.cwd(), 'data', 'uploads', projectId, 'images');
}

/**
 * On-demand Vision 분석: 단일 이미지를 GPT Vision으로 분석
 * RFP 분석 시 RAG 검색에서 매칭된 이미지에 대해서만 호출
 */
export async function analyzeImageOnDemand(imagePath: string): Promise<{
  description: string;
  keywords: string[];
}> {
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
    };
  } catch {
    return { description: '이미지 분석 실패', keywords: [] };
  }
}

/**
 * 여러 이미지를 on-demand Vision 분석 (최대 3장)
 */
export async function analyzeImagesOnDemand(
  imagePaths: string[],
): Promise<Array<{ imagePath: string; description: string; keywords: string[] }>> {
  const targets = imagePaths.slice(0, MAX_ONDEMAND_IMAGES);
  const results: Array<{ imagePath: string; description: string; keywords: string[] }> = [];

  for (const imgPath of targets) {
    try {
      const analysis = await analyzeImageOnDemand(imgPath);
      results.push({ imagePath: imgPath, ...analysis });
    } catch {
      results.push({ imagePath: imgPath, description: '분석 실패', keywords: [] });
    }
  }

  return results;
}
