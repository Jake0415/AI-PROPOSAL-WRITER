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
import { splitTextIntoChunks, createEmbeddings, createEmbedding } from './embedding.service';
import { convertPdfToImages, getPageImagesDir } from './pdf-image.service';

export interface RagSearchResult {
  chunks: Array<{ text: string; pageNumber: number; score: number }>;
  pageImages: Array<{ pageNumber: number; base64: string }>;
}

/**
 * PDF를 벡터화하여 Qdrant에 등록
 * 1. 텍스트 청크 → 임베딩 → Qdrant
 * 2. PDF → 페이지별 이미지 변환
 */
export async function registerVectors(
  projectId: string,
  rawText: string,
  pdfPath: string,
  onProgress?: (step: string, progress: number) => void,
): Promise<{ chunkCount: number; pageCount: number }> {
  const collectionName = getCollectionName(projectId);

  // 기존 컬렉션 삭제 후 재생성
  onProgress?.('기존 벡터 초기화', 10);
  await deleteCollection(collectionName);
  await ensureCollection(collectionName);

  // 1. 텍스트 청크 분할
  onProgress?.('텍스트 청크 분할', 20);
  const chunks = splitTextIntoChunks(rawText);

  // 2. 임베딩 생성
  onProgress?.('임베딩 생성', 40);
  const embeddings = await createEmbeddings(chunks.map(c => c.text));

  // 3. Qdrant에 저장
  onProgress?.('벡터 저장', 60);
  const points = chunks.map((chunk, i) => ({
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

  // 배치로 저장 (100개씩)
  for (let i = 0; i < points.length; i += 100) {
    await upsertPoints(collectionName, points.slice(i, i + 100));
  }

  // 4. PDF → 페이지별 이미지 변환
  onProgress?.('페이지 이미지 변환', 80);
  const pagesDir = getPageImagesDir(projectId);
  const pageImages = await convertPdfToImages(pdfPath, pagesDir);

  onProgress?.('벡터 등록 완료', 100);

  return {
    chunkCount: chunks.length,
    pageCount: pageImages.length,
  };
}

/**
 * RAG 검색: 쿼리와 유사한 텍스트 청크 + 관련 페이지 이미지 반환
 */
export async function ragSearch(
  projectId: string,
  query: string,
  topK = 10,
): Promise<RagSearchResult> {
  const collectionName = getCollectionName(projectId);

  // 쿼리 임베딩
  const queryVector = await createEmbedding(query);

  // Qdrant 검색
  const results = await searchPoints(collectionName, queryVector, topK);

  // 텍스트 청크 수집
  const chunks = results.map(r => ({
    text: (r.payload?.text as string) ?? '',
    pageNumber: (r.payload?.pageNumber as number) ?? 0,
    score: r.score,
  }));

  // 관련 페이지 번호 (중복 제거, 최대 3장)
  const pageNumbers = [...new Set(chunks.map(c => c.pageNumber).filter(p => p > 0))].slice(0, 3);

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

  return { chunks, pageImages };
}
