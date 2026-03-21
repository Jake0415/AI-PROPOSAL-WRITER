import { v4 as uuidv4 } from 'uuid';
import { readFile } from 'fs/promises';
import path from 'path';
import {
  ensureCollection,
  deleteCollection,
  upsertPoints,
  searchPoints,
  getCollectionName,
} from './qdrant-client';
import { splitTextIntoChunks, createEmbeddingsWithProgress, createEmbedding } from './embedding.service';
import {
  convertSelectivePdfToImages,
  convertPdfToImages,
  generateBatchImageMetadata,
  getPageImagesDir,
} from './pdf-image.service';
import type { SSEProgress } from '@/lib/utils/sse-stream';
import type { ImageMetadata } from './pdf-image.service';

export interface RagSearchResult {
  chunks: Array<{ text: string; pageNumber: number; score: number }>;
  imageMatches: Array<{ pageNumber: number; description: string; keywords: string[]; score: number }>;
  pageImages: Array<{ pageNumber: number; base64: string }>;
}

export interface VectorRegistrationResult {
  chunkCount: number;
  imageChunkCount: number;
  pageCount: number;
  elapsedMs: number;
  embeddingModel: string;
  chunkSizeTokens: number;
}

const VECTOR_STEPS = [
  '기존 벡터 초기화',
  '텍스트 청크 분할',
  '임베딩 생성',
  '텍스트 벡터 저장',
  '이미지 페이지 변환',
  '이미지 메타데이터 생성',
  '이미지 벡터 저장',
  '완료',
];

/**
 * PDF를 벡터화하여 Qdrant에 등록
 * 8단계 SSE 스트리밍: 텍스트 청크 + 이미지 메타데이터
 */
export async function registerVectors(
  projectId: string,
  rawText: string,
  pdfPath: string,
  onProgress?: (p: SSEProgress) => void,
  imagePages?: number[],
): Promise<VectorRegistrationResult> {
  const startTime = Date.now();
  const collectionName = getCollectionName(projectId);

  function progress(stepIndex: number, detail?: string, pct?: number) {
    const base = VECTOR_STEPS[stepIndex];
    const step = detail ? `${base} - ${detail}` : base;
    onProgress?.({
      step,
      progress: pct ?? Math.round((stepIndex / VECTOR_STEPS.length) * 100),
      stepIndex,
      totalSteps: VECTOR_STEPS.length,
      ...(stepIndex === 0 ? { steps: VECTOR_STEPS } : {}),
    });
  }

  // Step 0: 기존 벡터 초기화
  progress(0);
  await deleteCollection(collectionName);
  await ensureCollection(collectionName);

  // Step 1: 텍스트 청크 분할
  progress(1);
  const chunks = splitTextIntoChunks(rawText);
  progress(1, `${chunks.length}개 청크 생성됨`, 12);

  // Step 2: 임베딩 생성 (배치별 진행률)
  progress(2, `0/${chunks.length} 청크`, 15);
  const embeddings = await createEmbeddingsWithProgress(
    chunks.map(c => c.text),
    (completed, total) => {
      const pct = 15 + Math.round((completed / total) * 20); // 15-35%
      progress(2, `${completed}/${total} 청크`, pct);
    },
  );

  // Step 3: 텍스트 벡터 저장 (배치별 진행률)
  progress(3, `0/${chunks.length} 포인트`, 35);
  const textPoints = chunks.map((chunk, i) => ({
    id: uuidv4(),
    vector: embeddings[i],
    payload: {
      text: chunk.text,
      pageNumber: chunk.pageNumber ?? 0,
      chunkIndex: chunk.chunkIndex,
      type: 'text' as const,
      projectId,
    },
  }));

  const BATCH = 100;
  for (let i = 0; i < textPoints.length; i += BATCH) {
    await upsertPoints(collectionName, textPoints.slice(i, i + BATCH));
    const completed = Math.min(i + BATCH, textPoints.length);
    const pct = 35 + Math.round((completed / textPoints.length) * 15); // 35-50%
    progress(3, `${completed}/${textPoints.length} 포인트`, pct);
  }

  // Step 4: 이미지 페이지 변환 (선택적)
  progress(4, '', 50);
  const pagesDir = getPageImagesDir(projectId);
  const hasImagePages = imagePages && imagePages.length > 0;

  const pageImages = hasImagePages
    ? await convertSelectivePdfToImages(pdfPath, pagesDir, imagePages)
    : await convertPdfToImages(pdfPath, pagesDir);

  progress(4, `${pageImages.length}장 변환 완료`, 60);

  // Step 5: 이미지 메타데이터 생성 (GPT Vision)
  let imageMetadataList: ImageMetadata[] = [];
  if (pageImages.length > 0 && hasImagePages) {
    progress(5, `0/${pageImages.length}장 분석 중`, 60);
    imageMetadataList = await generateBatchImageMetadata(
      pageImages,
      (completed, total) => {
        const pct = 60 + Math.round((completed / total) * 20); // 60-80%
        progress(5, `${completed}/${total}장 분석 완료`, pct);
      },
    );
  } else {
    progress(5, '이미지 페이지 없음 (스킵)', 80);
  }

  // Step 6: 이미지 벡터 저장
  let imageChunkCount = 0;
  if (imageMetadataList.length > 0) {
    progress(6, `${imageMetadataList.length}개 이미지 벡터화`, 80);

    const descriptions = imageMetadataList.map(m =>
      `${m.description} ${m.keywords.join(' ')}`,
    );
    const imageEmbeddings = await createEmbeddingsWithProgress(descriptions);

    const imagePoints = imageMetadataList.map((meta, i) => ({
      id: uuidv4(),
      vector: imageEmbeddings[i],
      payload: {
        type: 'image' as const,
        description: meta.description,
        keywords: meta.keywords,
        pageNumber: meta.pageNumber,
        imagePath: meta.imagePath,
        projectId,
      },
    }));

    await upsertPoints(collectionName, imagePoints);
    imageChunkCount = imagePoints.length;
    progress(6, `${imageChunkCount}개 저장 완료`, 90);
  } else {
    progress(6, '스킵', 90);
  }

  // Step 7: 완료
  progress(7, '', 100);

  return {
    chunkCount: chunks.length,
    imageChunkCount,
    pageCount: pageImages.length,
    elapsedMs: Date.now() - startTime,
    embeddingModel: 'text-embedding-3-small',
    chunkSizeTokens: 2048,
  };
}

/**
 * RAG 검색: 텍스트 청크 + 이미지 매칭 + 페이지 이미지 반환
 */
export async function ragSearch(
  projectId: string,
  query: string,
  topK = 15,
): Promise<RagSearchResult> {
  const collectionName = getCollectionName(projectId);

  const queryVector = await createEmbedding(query);
  const results = await searchPoints(collectionName, queryVector, topK);

  const textChunks: RagSearchResult['chunks'] = [];
  const imageMatches: RagSearchResult['imageMatches'] = [];

  for (const r of results) {
    if (r.payload?.type === 'image') {
      imageMatches.push({
        pageNumber: (r.payload.pageNumber as number) ?? 0,
        description: (r.payload.description as string) ?? '',
        keywords: (r.payload.keywords as string[]) ?? [],
        score: r.score,
      });
    } else {
      textChunks.push({
        text: (r.payload?.text as string) ?? '',
        pageNumber: (r.payload?.pageNumber as number) ?? 0,
        score: r.score,
      });
    }
  }

  // text + image 양쪽에서 페이지 번호 수집 (최대 5장)
  const pageNumbers = [
    ...new Set([
      ...textChunks.map(c => c.pageNumber).filter(p => p > 0),
      ...imageMatches.map(m => m.pageNumber).filter(p => p > 0),
    ]),
  ].slice(0, 5);

  // 페이지 이미지 로드 (base64)
  const pagesDir = getPageImagesDir(projectId);
  const pageImages: Array<{ pageNumber: number; base64: string }> = [];

  for (const pageNum of pageNumbers) {
    try {
      const imagePath = path.join(pagesDir, `page.${pageNum}.png`);
      const buffer = await readFile(imagePath);
      pageImages.push({
        pageNumber: pageNum,
        base64: buffer.toString('base64'),
      });
    } catch { /* 이미지 없으면 무시 */ }
  }

  return { chunks: textChunks, imageMatches, pageImages };
}
