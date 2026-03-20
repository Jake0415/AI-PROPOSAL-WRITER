import type { ProjectStatus } from '@/lib/db/schema';

const STATUS_PROGRESS: Record<ProjectStatus, number> = {
  uploaded: 10,
  analyzing: 20,
  direction_set: 35,
  strategy_set: 50,
  outline_ready: 65,
  generating: 75,
  sections_ready: 85,
  reviewing: 90,
  completed: 100,
};

export function getProjectProgress(status: ProjectStatus): number {
  return STATUS_PROGRESS[status] ?? 0;
}
