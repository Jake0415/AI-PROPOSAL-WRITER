import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 지연 초기화 (환경변수가 없을 때 빌드 타임 에러 방지)
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다');
    }
    const client = postgres(connectionString, {
      prepare: false,
    });
    _db = drizzle(client, { schema });
  }
  return _db;
}
