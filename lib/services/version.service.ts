import { versionRepository } from '@/lib/repositories/version.repository';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import { reviewRepository } from '@/lib/repositories/review.repository';
import { priceRepository } from '@/lib/repositories/price.repository';

export const versionService = {
  /** 현재 프로젝트 상태를 스냅샷으로 저장 */
  async createSnapshot(projectId: string, label: string, createdBy?: string) {
    const [analysis, direction, strategy, outline, sections, review, price] = await Promise.all([
      rfpRepository.getAnalysisByProjectId(projectId),
      proposalRepository.getDirection(projectId),
      proposalRepository.getStrategy(projectId),
      proposalRepository.getOutline(projectId),
      proposalRepository.getSectionsByProject(projectId),
      reviewRepository.getByProjectId(projectId),
      priceRepository.getByProjectId(projectId),
    ]);

    const snapshot: Record<string, unknown> = {
      analysis: analysis ?? null,
      direction: direction ?? null,
      strategy: strategy ?? null,
      outline: outline ?? null,
      sections: sections ?? [],
      review: review ?? null,
      price: price ?? null,
      snapshotAt: new Date().toISOString(),
    };

    return versionRepository.create({ projectId, label, snapshot, createdBy });
  },

  /** 버전 목록 조회 */
  async listVersions(projectId: string) {
    return versionRepository.findByProject(projectId);
  },

  /** 버전 상세 조회 */
  async getVersion(versionId: string) {
    return versionRepository.findById(versionId);
  },

  /** 두 버전 비교 (간단 diff) */
  async compareVersions(versionId1: string, versionId2: string) {
    const [v1, v2] = await Promise.all([
      versionRepository.findById(versionId1),
      versionRepository.findById(versionId2),
    ]);

    if (!v1 || !v2) return null;

    const s1 = v1.snapshot as Record<string, unknown>;
    const s2 = v2.snapshot as Record<string, unknown>;

    const changes: Array<{ field: string; v1Summary: string; v2Summary: string }> = [];

    for (const key of new Set([...Object.keys(s1), ...Object.keys(s2)])) {
      if (key === 'snapshotAt') continue;
      const val1 = JSON.stringify(s1[key] ?? null);
      const val2 = JSON.stringify(s2[key] ?? null);
      if (val1 !== val2) {
        changes.push({
          field: key,
          v1Summary: val1.slice(0, 200),
          v2Summary: val2.slice(0, 200),
        });
      }
    }

    return {
      version1: { id: v1.id, versionNumber: v1.versionNumber, label: v1.label, createdAt: v1.createdAt },
      version2: { id: v2.id, versionNumber: v2.versionNumber, label: v2.label, createdAt: v2.createdAt },
      changes,
      totalChanges: changes.length,
    };
  },
};
