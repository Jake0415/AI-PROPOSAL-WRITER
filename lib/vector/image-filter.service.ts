import { readFile } from 'fs/promises';
import OpenAI from 'openai';
import { DEFAULT_GPT_MODEL, isGpt5Model } from '@/lib/ai/models';
import type { ExtractedImage } from './pymupdf-extractor';

const MIN_FILTER_SIZE = 100;  // 100x100px 미만 자동 skip
const MAX_RATIO = 10;         // 비율 10:1 초과 자동 skip
const MAX_FILTER_IMAGES = 20;
const FILTER_CONCURRENCY = 3;

export interface FilteredImage {
  image: ExtractedImage;
  status: 'keep' | 'skip' | 'auto_skip';
  reason: string;
  description?: string;
  keywords?: string[];
}

/**
 * 사전 필터: 크기/비율 기반 자동 skip
 */
function preFilter(img: ExtractedImage): { pass: boolean; reason: string } {
  if (img.width < MIN_FILTER_SIZE || img.height < MIN_FILTER_SIZE) {
    return { pass: false, reason: `크기 미달 (${img.width}x${img.height} < ${MIN_FILTER_SIZE}px)` };
  }
  const ratio = Math.max(img.width, img.height) / Math.min(img.width, img.height);
  if (ratio > MAX_RATIO) {
    return { pass: false, reason: `비율 초과 (${ratio.toFixed(1)}:1 > ${MAX_RATIO}:1)` };
  }
  return { pass: true, reason: '' };
}

/**
 * LLM Vision 필터: keep/skip 판정 + description/keywords 동시 생성
 */
async function visionFilter(imagePath: string): Promise<{
  keep: boolean;
  reason: string;
  description: string;
  keywords: string[];
}> {
  const buffer = await readFile(imagePath);
  const base64 = buffer.toString('base64');

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
          text: `이 이미지는 공공입찰 RFP(제안요청서) 문서의 일부입니다.

1. 이 이미지가 제안서 분석에 유의미한지 판단하세요:
   - keep: 시스템 구성도, 데이터 흐름도, 아키텍처, 표, 차트, 일정표, 조직도 등
   - skip: 로고, 아이콘, 장식, 워터마크, 빈 이미지, 페이지 번호

2. keep인 경우 이미지 내용을 분석하세요.

JSON 응답: {"keep": true/false, "reason": "판단 이유", "description": "이미지 상세 설명 (한국어)", "keywords": ["키워드1", "키워드2"]}`,
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
      keep: parsed.keep ?? false,
      reason: parsed.reason ?? '',
      description: parsed.description ?? '',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    };
  } catch {
    return { keep: true, reason: '파싱 실패 (기본 keep)', description: '분석 실패', keywords: [] };
  }
}

/**
 * 이미지 배치 필터링: 사전필터 + Vision 필터 통합
 */
export async function filterImages(
  images: ExtractedImage[],
  onProgress?: (completed: number, total: number) => void,
): Promise<FilteredImage[]> {
  const results: FilteredImage[] = [];
  const targets = images.slice(0, MAX_FILTER_IMAGES);

  // 사전 필터
  const visionCandidates: ExtractedImage[] = [];
  for (const img of targets) {
    const { pass, reason } = preFilter(img);
    if (!pass) {
      results.push({ image: img, status: 'auto_skip', reason });
    } else {
      visionCandidates.push(img);
    }
  }

  // Vision 필터 (배치 병렬)
  const total = visionCandidates.length;
  for (let i = 0; i < total; i += FILTER_CONCURRENCY) {
    const batch = visionCandidates.slice(i, i + FILTER_CONCURRENCY);
    const batchResults = await Promise.allSettled(
      batch.map(async img => {
        const result = await visionFilter(img.path);
        return {
          image: img,
          status: result.keep ? 'keep' as const : 'skip' as const,
          reason: result.reason,
          description: result.description,
          keywords: result.keywords,
        };
      }),
    );

    for (const r of batchResults) {
      if (r.status === 'fulfilled') {
        results.push(r.value);
      }
    }
    onProgress?.(Math.min(i + FILTER_CONCURRENCY, total), total);
  }

  return results;
}
