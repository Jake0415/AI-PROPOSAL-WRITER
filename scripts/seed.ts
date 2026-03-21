import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import * as schema from '../lib/db/schema';

const SALT_ROUNDS = 12;

const SEED_USERS = [
  {
    loginId: '1111',
    password: '1111',
    name: '최고관리자',
    phone: '010-0000-0000',
    department: '시스템관리',
    role: 'super_admin' as const,
  },
  {
    loginId: '2222',
    password: '2222',
    name: '관리자',
    phone: '010-1111-1111',
    department: '제안팀',
    role: 'admin' as const,
  },
  {
    loginId: 'testuser',
    password: 'test1234',
    name: '테스트사용자',
    phone: '010-2222-2222',
    department: '개발팀',
    role: 'viewer' as const,
  },
];

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL 환경변수가 설정되지 않았습니다');
    process.exit(1);
  }

  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client, { schema });

  console.log('시드 데이터 생성 시작...\n');

  for (const user of SEED_USERS) {
    const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);

    await db.insert(schema.profiles).values({
      id: randomUUID(),
      loginId: user.loginId,
      passwordHash,
      name: user.name,
      phone: user.phone,
      department: user.department,
      role: user.role,
    }).onConflictDoUpdate({
      target: schema.profiles.loginId,
      set: {
        passwordHash,
        name: user.name,
        phone: user.phone,
        department: user.department,
        role: user.role,
        updatedAt: new Date(),
      },
    });

    console.log(`✅ ${user.loginId} (${user.role}) - UPSERT 완료`);
  }

  console.log('\n시드 완료!');
  console.log('─────────────────────────────────────');
  console.log('최고관리자: 1111 / 1111');
  console.log('관리자:     2222 / 2222');
  console.log('테스트:     testuser / test1234');
  console.log('─────────────────────────────────────');

  await client.end();
}

seed().catch((err) => {
  console.error('시드 실패:', err);
  process.exit(1);
});
