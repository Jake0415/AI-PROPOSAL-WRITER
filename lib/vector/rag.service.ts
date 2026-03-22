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
import { filterImages } from './image-filter.service';
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
  filteredImageCount: number;
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
  '1차 이미지 추출 (임베딩 객체)',
  '2차 이미지 추출 (페이지 렌더링)',
  'LLM Vision 필터링',
  '유효 이미지 벡터 저장',
  '완료',
];

/**
 * PDF를 벡터화하여 Qdrant에 등록
 * 9단계 SSE: 텍스트 + 하이브리드 이미지 추출 + Vision 필터링
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

  // Step 2: 임베딩 생성
  progress(2, `0/${chunks.length} 청크`, 15);
  const embeddings = await createEmbeddingsWithProgress(
    chunks.map(c => c.text),
    (completed, total) => {
      const pct = 15 + Math.round((completed / total) * 18);
      progress(2, `${completed}/${total} 청크`, pct);
    },
  );

  // Step 3: 텍스트 벡터 저장
  progress(3, `0/${chunks.length} 포인트`, 33);
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
    const pct = 33 + Math.round((completed / textPoints.length) * 12);
    progress(3, `${completed}/${textPoints.length} 포인트`, pct);
  }

  // Step 4: 1차 이미지 추출 (PyMuPDF 임베딩 객체)
  progress(4, 'PyMuPDF 이미지 객체 추출 중', 45);
  const extractedImages = await extractImagesWithPyMuPDF(pdfPath, projectId, imagePages);
  const elementImages = extractedImages.filter(img => img.type === 'element');
  const pageRenders = extractedImages.filter(img => img.type === 'page_render');
  progress(4, `${elementImages.length}개 이미지 객체 추출됨`, 50);

  // Step 5: 2차 이미지 추출 (imagePages 페이지 렌더링)
  progress(5, `${pageRenders.length}개 페이지 렌더링됨`, 55);

  // DB 메타데이터 저장
  await imageMetadataRepository.deleteByProjectId(projectId);
  const allImages = [...elementImages, ...pageRenders];

  if (allImages.length > 0) {
    await imageMetadataRepository.bulkCreate(
      allImages.map(img => ({
        projectId,
        pageNumber: img.page,
        imageIndex: img.index,
        imageType: img.type === 'element' ? 'element' as const : 'page_render' as const,
        imagePath: img.path,
        width: img.width,
        height: img.height,
        filterStatus: 'pending' as const,
      })),
    );
  }
  progress(5, `${allImages.length}개 DB 저장`, 58);

  // Step 6: LLM Vision 필터링 (keep/skip 판정 + description 동시 생성)
  let keepImages: Array<{ path: string; description: string; keywords: string[] }> = [];
  let filteredCount = 0;

  if (allImages.length > 0) {
    progress(6, `0/${allImages.length}개 필터링 중`, 58);
    const filterResults = await filterImages(
      allImages,
      (completed, total) => {
        const pct = 58 + Math.round((completed / total) * 22);
        progress(6, `${completed}/${total}개 필터링 완료`, pct);
      },
    );

    // DB 업데이트
    for (const fr of filterResults) {
      const dbRecord = (await imageMetadataRepository.findByProjectId(projectId))
        .find(r => r.imagePath === fr.image.path);
      if (dbRecord) {
        await imageMetadataRepository.updateMetadata(dbRecord.id, {
          description: fr.description,
          keywords: fr.keywords ?? [],
          filterStatus: fr.status,
          filterReason: fr.reason,
        });
      }
    }

    keepImages = filterResults
      .filter(fr => fr.status === 'keep')
      .map(fr => ({
        path: fr.image.path,
        description: fr.description ?? '',
        keywords: fr.keywords ?? [],
      }));
    filteredCount = filterResults.filter(fr => fr.status !== 'keep').length;

    progress(6, `${keepImages.length}개 유효 / ${filteredCount}개 제거`, 80);
  } else {
    progress(6, '이미지 없음 (스킵)', 80);
  }

  // Step 7: 유효 이미지 벡터 저장
  let imageChunkCount = 0;
  if (keepImages.length > 0) {
    progress(7, `${keepImages.length}개 벡터화`, 80);

    const descriptions = keepImages.map(img =>
      `${img.description} ${img.keywords.join(' ')}`,
    );
    const imageEmbeddings = await createEmbeddingsWithProgress(descriptions);

    const imagePoints = keepImages.map((img, i) => ({
      id: uuidv4(),
      vector: imageEmbeddings[i],
      payload: {
        type: 'image' as const,
        description: img.description,
        keywords: img.keywords,
        imagePath: img.path,
        projectId,
      },
    }));

    await upsertPoints(collectionName, imagePoints);
    imageChunkCount = imagePoints.length;
    progress(7, `${imageChunkCount}개 저장 완료`, 92);
  } else {
    progress(7, '유효 이미지 없음 (스킵)', 92);
  }

  // Step 8: 완료
  progress(8, '', 100);

  return {
    chunkCount: chunks.length,
    extractedImageCount: allImages.length,
    filteredImageCount: filteredCount,
    imageChunkCount,
    elapsedMs: Date.now() - startTime,
    embeddingModel: 'text-embedding-3-small',
    chunkSizeTokens: 1024,
  };
}

/**
 * RAG 검색: 텍스트 청크 + 이미지 매칭
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
