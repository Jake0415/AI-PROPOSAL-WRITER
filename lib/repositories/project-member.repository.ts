import { eq, and } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { projectMembers } from '@/lib/db/schema';
import type { ProjectRole } from '@/lib/db/schema';

export const projectMemberRepository = {
  async addMember(projectId: string, userId: string, role: ProjectRole = 'viewer') {
    const db = getDb();
    const [member] = await db.insert(projectMembers).values({
      projectId,
      userId,
      role,
    }).returning();
    return member;
  },

  async removeMember(projectId: string, memberId: string) {
    const db = getDb();
    await db
      .delete(projectMembers)
      .where(and(eq(projectMembers.id, memberId), eq(projectMembers.projectId, projectId)));
  },

  async updateRole(memberId: string, role: ProjectRole) {
    const db = getDb();
    await db
      .update(projectMembers)
      .set({ role })
      .where(eq(projectMembers.id, memberId));
  },

  async getMembers(projectId: string) {
    const db = getDb();
    return db
      .select()
      .from(projectMembers)
      .where(eq(projectMembers.projectId, projectId));
  },

  async getMemberByUser(projectId: string, userId: string) {
    const db = getDb();
    const results = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)));
    return results[0];
  },
};
