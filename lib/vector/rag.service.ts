import { v4 as uuidv4 } from 'uuid';
import {
  ensureCollection,
  deleteCollection,
  upsertPoints,
  searchPoints,
  getCollectionName,
} from './qdrant-client';
import { splitTextIntoChunks, createEmbeddingsWithProgress, createEmbedding } from './embedding.service';
import { extractImagesWithPyMuPDF } from './pymupdf-extractor';
import { imageMetadataRepository } from '@/lib/repositories/image-metadata.repository';
import { getPageImagesDir } from './pdf-image.service';
import type { SSEProgress } from '@/lib/utils/sse-stream';

export interface RagSearchResult {
  chunks: Array<{ text: string; pageNumber: number; score: number }>;
  imageMatches: Array<{ pageNumber: number; description: string; keywords: string[]; imagePath: string; score: number }>;
}

export interface VectorRegistrationResult {
  chunkCount: number;
  extractedImageCount: number;
  imageChunkCount: number;
  elapsedMs: number;
  embeddingModel: string;
  chunkSizeTokens: number;
}

const VECTOR_STEPS = [
  '기존 벡터 초기화',
  '텍스트 청크 분할',
  '임베딩 생성',
  '텍스트 벡터 저장',
  '개별 이미지 추출 (PyMuPDF)',
  '이미지 메타 벡터 저장',
  '완료',
];

/**
 * PDF를 벡터화하여 Qdrant에 등록
 * 7단계 SSE: 텍스트 벡터화 + PyMuPDF 이미지 추출 + 메타 벡터화
 */
export async function registerVectors(
  projectId: string,
  rawText: string,
  pdfPath: string,
  onProgress?: (p: SSEProgress) => void,
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
  progress(1, `${chunks.length}개 청크 생성됨`, 15);

  // Step 2: 임베딩 생성
  progress(2, `0/${chunks.length} 청크`, 18);
  const embeddings = await createEmbeddingsWithProgress(
    chunks.map(c => c.text),
    (completed, total) => {
      const pct = 18 + Math.round((completed / total) * 25);
      progress(2, `${completed}/${total} 청크`, pct);
    },
  );

  // Step 3: 텍스트 벡터 저장
  progress(3, `0/${chunks.length} 포인트`, 43);
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
    const pct = 43 + Math.round((completed / textPoints.length) * 17);
    progress(3, `${completed}/${textPoints.length} 포인트`, pct);
  }

  // Step 4: PyMuPDF 개별 이미지 추출 + DB 저장
  progress(4, 'PyMuPDF 이미지 추출 중', 60);
  const extractedImages = await extractImagesWithPyMuPDF(pdfPath, projectId);
  progress(4, `${extractedImages.length}개 이미지 추출됨`, 68);

  // DB 메타데이터 저장
  await imageMetadataRepository.deleteByProjectId(projectId);
  if (extractedImages.length > 0) {
    await imageMetadataRepository.bulkCreate(
      extractedImages.map(img => ({
        projectId,
        pageNumber: img.page,
        imageIndex: img.index,
        imageType: 'element' as const,
        imagePath: img.path,
        width: img.width,
        height: img.height,
      })),
    );
  }
  progress(4, `${extractedImages.length}개 DB 저장`, 72);

  // Step 5: 이미지 메타 임베딩 → Qdrant 저장
  let imageChunkCount = 0;
  if (extractedImages.length > 0) {
    progress(5, `${extractedImages.length}개 벡터화`, 72);

    // 메타정보 기반 임베딩 (Vision 없이)
    const metaTexts = extractedImages.map(img =>
      `page ${img.page} image: ${img.width}x${img.height} ${img.filename}`,
    );
    const imageEmbeddings = await createEmbeddingsWithProgress(metaTexts);

    const imagePoints = extractedImages.map((img, i) => ({
      id: uuidv4(),
      vector: imageEmbeddings[i],
      payload: {
        type: 'image' as const,
        description: `Page ${img.page} 이미지 (${img.width}x${img.height})`,
        keywords: [] as string[],
        pageNumber: img.page,
        imagePath: img.path,
        projectId,
      },
    }));

    await upsertPoints(collectionName, imagePoints);
    imageChunkCount = imagePoints.length;
    progress(5, `${imageChunkCount}개 저장 완료`, 90);
  } else {
    progress(5, '이미지 없음 (스킵)', 90);
  }

  // Step 6: 완료
  progress(6, '', 100);

  return {
    chunkCount: chunks.length,
    extractedImageCount: extractedImages.length,
    imageChunkCount,
    elapsedMs: Date.now() - startTime,
    embeddingModel: 'text-embedding-3-small',
    chunkSizeTokens: 2048,
  };
}

/**
 * RAG 검색: 텍스트 청크 + 이미지 메타 매칭
 * Vision 분석은 여기서 하지 않음 (analysis.service에서 on-demand)
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
        imagePath: (r.payload.imagePath as string) ?? '',
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

  return { chunks: textChunks, imageMatches };
}
