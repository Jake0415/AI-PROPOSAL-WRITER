import OpenAI from 'openai';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const CHUNK_SIZE_TOKENS = 2048;
const CHUNK_OVERLAP_TOKENS = 200;

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    // DB 키 로드는 비동기이므로 환경변수로 폴백
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

/**
 * 간이 토큰 추정 (한국어 혼합 문서 기준)
 * - 한국어: ~1.5 tokens/char
 * - 영어: ~0.25 tokens/char (단어 평균 4자)
 * - 혼합 문서 평균: ~1.0 tokens/char (보수적)
 * - text-embedding-3-small 한도: 8191 tokens
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length * 1.0);
}

/** 토큰 추정치를 글자 수로 역변환 */
function tokensToChars(tokens: number): number {
  return Math.floor(tokens / 1.0);
}

export interface TextChunk {
  text: string;
  chunkIndex: number;
  pageNumber?: number;
}

/** 텍스트를 청크로 분할 (4096토큰 기반) */
export function splitTextIntoChunks(
  text: string,
  chunkSizeTokens = CHUNK_SIZE_TOKENS,
  overlapTokens = CHUNK_OVERLAP_TOKENS,
): TextChunk[] {
  const chunks: TextChunk[] = [];
  const lines = text.split('\n');
  let current = '';
  let chunkIndex = 0;
  let pageNumber = 1;

  const maxChars = tokensToChars(chunkSizeTokens);
  const overlapChars = tokensToChars(overlapTokens);

  for (const line of lines) {
    // 페이지 구분자 감지 (pdf-parse 출력: "-- N of M --")
    const pageMatch = line.match(/^--\s*(\d+)\s*of\s*\d+\s*--$/);
    if (pageMatch) {
      pageNumber = parseInt(pageMatch[1], 10);
      continue;
    }

    if (current.length + line.length > maxChars && current.length > 0) {
      chunks.push({ text: current.trim(), chunkIndex: chunkIndex++, pageNumber });
      // 오버랩: 마지막 overlapChars 글자를 유지
      current = current.slice(-overlapChars) + line + '\n';
    } else {
      current += line + '\n';
    }
  }

  if (current.trim()) {
    chunks.push({ text: current.trim(), chunkIndex: chunkIndex, pageNumber });
  }

  return chunks;
}

/** 텍스트 배열을 임베딩 벡터로 변환 */
export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const client = getClient();

  // OpenAI API는 한번에 최대 2048개까지 처리 가능
  const batchSize = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });
    allEmbeddings.push(...response.data.map(d => d.embedding));
  }

  return allEmbeddings;
}

/** 텍스트 배열을 임베딩 벡터로 변환 (배치별 진행률 콜백) */
export async function createEmbeddingsWithProgress(
  texts: string[],
  onBatchComplete?: (completed: number, total: number) => void,
): Promise<number[][]> {
  const client = getClient();
  const batchSize = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });
    allEmbeddings.push(...response.data.map(d => d.embedding));
    onBatchComplete?.(Math.min(i + batchSize, texts.length), texts.length);
  }

  return allEmbeddings;
}

/** 단일 텍스트 임베딩 */
export async function createEmbedding(text: string): Promise<number[]> {
  const [embedding] = await createEmbeddings([text]);
  return embedding;
}
