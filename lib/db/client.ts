import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// postgres.js 클라이언트 (Supabase Transaction mode 호환)
const client = postgres(connectionString, {
  prepare: false, // Supabase Transaction mode에서는 prepared statements 비활성화
});

const db = drizzle(client, { schema });

export function getDb() {
  return db;
}
