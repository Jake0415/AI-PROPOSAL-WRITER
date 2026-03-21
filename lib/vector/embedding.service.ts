import OpenAI from 'openai';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 100;

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    // DB 키 로드는 비동기이므로 환경변수로 폴백
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

export interface TextChunk {
  text: string;
  chunkIndex: number;
  pageNumber?: number;
}

/** 텍스트를 청크로 분할 */
export function splitTextIntoChunks(text: string, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP): TextChunk[] {
  const chunks: TextChunk[] = [];
  const lines = text.split('\n');
  let current = '';
  let chunkIndex = 0;
  let pageNumber = 1;

  for (const line of lines) {
    // 페이지 구분자 감지 (pdf-parse 출력: "-- N of M --")
    const pageMatch = line.match(/^--\s*(\d+)\s*of\s*\d+\s*--$/);
    if (pageMatch) {
      pageNumber = parseInt(pageMatch[1], 10);
      continue;
    }

    if (current.length + line.length > chunkSize && current.length > 0) {
      chunks.push({ text: current.trim(), chunkIndex: chunkIndex++, pageNumber });
      // 오버랩: 마지막 overlap 글자를 유지
      current = current.slice(-overlap) + line + '\n';
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

/** 단일 텍스트 임베딩 */
export async function createEmbedding(text: string): Promise<number[]> {
  const [embedding] = await createEmbeddings([text]);
  return embedding;
}
