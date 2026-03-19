import { eq, count } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { profiles } from '@/lib/db/schema';
import type { AppRole } from '@/lib/db/schema';

export const profileRepository = {
  async findAll() {
    const db = getDb();
    return db.select().from(profiles);
  },

  async findByUserId(userId: string) {
    const db = getDb();
    const results = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId));
    return results[0];
  },

  async findByLoginId(loginId: string) {
    const db = getDb();
    const results = await db
      .select()
      .from(profiles)
      .where(eq(profiles.loginId, loginId));
    return results[0];
  },

  async count() {
    const db = getDb();
    const result = await db.select({ value: count() }).from(profiles);
    return result[0]?.value ?? 0;
  },

  async create(data: {
    id: string;
    loginId: string;
    passwordHash: string;
    name: string;
    phone?: string;
    department?: string;
    role?: AppRole;
  }) {
    const db = getDb();
    const now = new Date().toISOString();
    await db.insert(profiles).values({
      id: data.id,
      loginId: data.loginId,
      passwordHash: data.passwordHash,
      name: data.name,
      phone: data.phone ?? '',
      department: data.department ?? '',
      role: data.role ?? 'viewer',
      createdAt: now,
      updatedAt: now,
    });
    return this.findByUserId(data.id);
  },

  async update(userId: string, data: {
    name?: string;
    phone?: string;
    department?: string;
    role?: AppRole;
    passwordHash?: string;
    avatarUrl?: string | null;
  }) {
    const db = getDb();
    await db
      .update(profiles)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(profiles.id, userId));
    return this.findByUserId(userId);
  },

  async updateRole(userId: string, role: AppRole) {
    const db = getDb();
    await db
      .update(profiles)
      .set({ role, updatedAt: new Date().toISOString() })
      .where(eq(profiles.id, userId));
  },

  async deleteUser(userId: string) {
    const db = getDb();
    await db.delete(profiles).where(eq(profiles.id, userId));
  },
};
