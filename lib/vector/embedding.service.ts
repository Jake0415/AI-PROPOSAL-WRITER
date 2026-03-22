import OpenAI from 'openai';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const CHUNK_SIZE_TOKENS = 1024;
const CHUNK_OVERLAP_TOKENS = 128;
const KOREAN_TOKEN_RATIO = 1.3;
const EMBEDDING_MAX_CHARS = 6000; // text-embedding-3-small 한도 8191토큰 → 안전 마진

let _client: OpenAI | null = null;
let _lastApiKey: string | undefined = undefined;

async function getClient(): Promise<OpenAI> {
  const { getApiKey } = await import('@/lib/ai/client');
  const apiKey = await getApiKey('gpt');
  if (!_client || apiKey !== _lastApiKey) {
    _lastApiKey = apiKey;
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

/** 토큰 추정 (한국어 비중 반영: 1.3 tokens/char) */
function tokensToChars(tokens: number): number {
  return Math.floor(tokens / KOREAN_TOKEN_RATIO);
}

export interface TextChunk {
  text: string;
  chunkIndex: number;
  pageNumber?: number;
}

/**
 * 구조 인식 청킹: 마크다운 섹션(##) 단위로 분할, 테이블 보존
 * - 섹션 헤더(##, ###)에서 청크를 나눔
 * - 테이블(| 연속 줄)은 가능한 하나로 유지하되, maxChars 초과 시 분할
 * - 테이블 분할 시 헤더(첫 2줄) 보존
 */
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

  // 테이블 헤더 저장 (분할 시 복원용)
  let tableHeader = '';

  function pushChunk() {
    const trimmed = current.trim();
    if (trimmed) {
      chunks.push({ text: trimmed, chunkIndex: chunkIndex++, pageNumber });
    }
    current = '';
  }

  function isHeading(line: string): boolean {
    return /^#{1,4}\s/.test(line);
  }

  function isTableLine(line: string): boolean {
    return line.trimStart().startsWith('|');
  }

  function isTableSeparator(line: string): boolean {
    return /^\|[\s\-:|]+\|/.test(line.trim());
  }

  let inTable = false;
  let tableLineCount = 0;

  for (const line of lines) {
    // 페이지 구분자 감지
    const pageMatch = line.match(/^--\s*(\d+)\s*of\s*\d+\s*--$/);
    if (pageMatch) {
      pageNumber = parseInt(pageMatch[1], 10);
      continue;
    }

    const isCurrentTable = isTableLine(line);

    // 테이블 종료
    if (inTable && !isCurrentTable && line.trim() !== '') {
      inTable = false;
      tableLineCount = 0;
      tableHeader = '';
    }

    // 테이블 시작
    if (isCurrentTable && !inTable) {
      inTable = true;
      tableLineCount = 0;
      tableHeader = '';
    }

    // 테이블 헤더 저장 (첫 2줄: 컬럼명 + 구분선)
    if (inTable) {
      tableLineCount++;
      if (tableLineCount <= 2) {
        tableHeader += line + '\n';
      }
    }

    // 섹션 헤더를 만나면 이전 청크를 저장하고 새 청크 시작
    if (isHeading(line) && current.trim().length > 0 && !inTable) {
      pushChunk();
    }

    // 청크 사이즈 초과 시 분할 (테이블 내부 포함)
    if (current.length + line.length > maxChars && current.length > 0) {
      pushChunk();

      if (inTable && tableHeader && tableLineCount > 2) {
        // 테이블 분할: 헤더를 다음 청크에 복원
        current = tableHeader;
      } else if (!inTable && chunks.length > 0) {
        // 일반 텍스트: 오버랩 유지
        const lastChunk = chunks[chunks.length - 1].text;
        current = lastChunk.slice(-overlapChars) + '\n';
      }
    }

    current += line + '\n';
  }

  pushChunk();

  return chunks;
}

/**
 * 임베딩 전 안전 분할: 임베딩 모델 한도(8191 토큰) 초과 시 자동 분할
 * 데이터 손실 없이 서브 청크로 분할하여 모든 내용 보존
 */
function safeSplitForEmbedding(texts: string[]): { splitTexts: string[]; originalIndices: number[] } {
  const splitTexts: string[] = [];
  const originalIndices: number[] = [];

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    if (text.length <= EMBEDDING_MAX_CHARS) {
      splitTexts.push(text);
      originalIndices.push(i);
    } else {
      // 초과 텍스트를 EMBEDDING_MAX_CHARS 단위로 분할
      for (let start = 0; start < text.length; start += EMBEDDING_MAX_CHARS) {
        splitTexts.push(text.substring(start, start + EMBEDDING_MAX_CHARS));
        originalIndices.push(i);
      }
    }
  }

  return { splitTexts, originalIndices };
}

/** 텍스트 배열을 임베딩 벡터로 변환 */
export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const client = await getClient();
  const { splitTexts } = safeSplitForEmbedding(texts);

  const batchSize = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < splitTexts.length; i += batchSize) {
    const batch = splitTexts.slice(i, i + batchSize);
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });
    allEmbeddings.push(...response.data.map(d => d.embedding));
  }

  // 분할된 경우 첫 번째 서브 청크의 임베딩만 사용 (원본 인덱스 기준)
  if (splitTexts.length === texts.length) return allEmbeddings;

  const { originalIndices } = safeSplitForEmbedding(texts);
  const result: number[][] = [];
  const seen = new Set<number>();
  for (let i = 0; i < originalIndices.length; i++) {
    if (!seen.has(originalIndices[i])) {
      seen.add(originalIndices[i]);
      result.push(allEmbeddings[i]);
    }
  }
  return result;
}

/** 텍스트 배열을 임베딩 벡터로 변환 (배치별 진행률 콜백) */
export async function createEmbeddingsWithProgress(
  texts: string[],
  onBatchComplete?: (completed: number, total: number) => void,
): Promise<number[][]> {
  const client = await getClient();
  const { splitTexts, originalIndices } = safeSplitForEmbedding(texts);

  const batchSize = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < splitTexts.length; i += batchSize) {
    const batch = splitTexts.slice(i, i + batchSize);
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });
    allEmbeddings.push(...response.data.map(d => d.embedding));
    onBatchComplete?.(Math.min(i + batchSize, texts.length), texts.length);
  }

  // 원본 텍스트 수만큼 임베딩 반환
  if (splitTexts.length === texts.length) return allEmbeddings;

  const result: number[][] = [];
  const seen = new Set<number>();
  for (let i = 0; i < originalIndices.length; i++) {
    if (!seen.has(originalIndices[i])) {
      seen.add(originalIndices[i]);
      result.push(allEmbeddings[i]);
    }
  }
  return result;
}

/** 단일 텍스트 임베딩 */
export async function createEmbedding(text: string): Promise<number[]> {
  const safeText = text.length > EMBEDDING_MAX_CHARS ? text.substring(0, EMBEDDING_MAX_CHARS) : text;
  const [embedding] = await createEmbeddings([safeText]);
  return embedding;
}
