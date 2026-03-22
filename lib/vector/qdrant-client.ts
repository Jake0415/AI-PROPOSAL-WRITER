import { QdrantClient } from '@qdrant/js-client-rest';

let _client: QdrantClient | null = null;

export function getQdrantClient(): QdrantClient {
  if (!_client) {
    _client = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
    });
  }
  return _client;
}

export async function ensureCollection(collectionName: string, vectorSize = 1536) {
  const client = getQdrantClient();
  const collections = await client.getCollections();
  const exists = collections.collections.some(c => c.name === collectionName);

  if (!exists) {
    await client.createCollection(collectionName, {
      vectors: { size: vectorSize, distance: 'Cosine' },
    });
  }
}

export async function deleteCollection(collectionName: string) {
  const client = getQdrantClient();
  try {
    await client.deleteCollection(collectionName);
  } catch { /* 없으면 무시 */ }
}

export async function upsertPoints(
  collectionName: string,
  points: Array<{
    id: string;
    vector: number[];
    payload: Record<string, unknown>;
  }>,
) {
  const client = getQdrantClient();
  await client.upsert(collectionName, { points });
}

export async function searchPoints(
  collectionName: string,
  queryVector: number[],
  limit = 10,
  filter?: Record<string, unknown>,
  scoreThreshold = 0.4,
) {
  const client = getQdrantClient();
  return client.search(collectionName, {
    vector: queryVector,
    limit,
    with_payload: true,
    filter: filter as never,
    score_threshold: scoreThreshold,
  });
}

export async function scrollPoints(
  collectionName: string,
  filter?: Record<string, unknown>,
  limit = 500,
) {
  const client = getQdrantClient();
  const result = await client.scroll(collectionName, {
    limit,
    with_payload: true,
    with_vector: false,
    filter: filter as never,
  });
  return result.points;
}

export function getCollectionName(projectId: string): string {
  return `rfp-${projectId}`;
}
