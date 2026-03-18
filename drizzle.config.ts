import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Next.js는 .env.local을 사용하므로 명시적으로 로드
config({ path: '.env.local' });

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // aiprowriter 스키마만 관리 (다른 프로젝트 스키마와 분리)
  schemaFilter: ['aiprowriter'],
});
