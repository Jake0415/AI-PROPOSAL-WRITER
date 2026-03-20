import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MemberAvatarGroup } from './member-avatar-group';
import { getProjectProgress } from '@/lib/utils/progress';
import { Users } from 'lucide-react';
import type { ProjectStatus } from '@/lib/db/schema';
import type { EnhancedProject } from './types';

interface ProjectCardProps {
  project: EnhancedProject;
  statusLabel: string;
  onManageMembers?: (projectId: string) => void;
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  uploaded: 'outline',
  analyzing: 'secondary',
  direction_set: 'secondary',
  strategy_set: 'secondary',
  outline_ready: 'secondary',
  generating: 'secondary',
  sections_ready: 'secondary',
  reviewing: 'secondary',
  completed: 'default',
};

export function ProjectCard({ project, statusLabel, onManageMembers }: ProjectCardProps) {
  const href =
    project.status === 'uploaded'
      ? `/projects/${project.id}/upload`
      : `/projects/${project.id}/analysis`;
  const progress = getProjectProgress(project.status as ProjectStatus);
  const members = (project.members ?? []).map((m) => ({
    name: m.user.name,
    avatarUrl: m.user.avatarUrl,
    role: m.role,
  }));

  return (
    <Link href={href}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardHeader className="space-y-3">
          {/* 상단: 상태 + 날짜 */}
          <div className="flex items-center justify-between">
            <Badge variant={STATUS_VARIANT[project.status] ?? 'outline'}>
              {statusLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(project.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>

          {/* 제목 */}
          <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>

          {/* RFP 요약 정보 */}
          {project.rfpAnalysis && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {project.rfpAnalysis.client && (
                <span>고객: {project.rfpAnalysis.client}</span>
              )}
              {project.rfpAnalysis.budget && (
                <span>예산: {project.rfpAnalysis.budget}</span>
              )}
              {project.rfpAnalysis.duration && (
                <span>기간: {project.rfpAnalysis.duration}</span>
              )}
            </div>
          )}

          {/* 진행률 */}
          <div className="flex items-center gap-2">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground w-8">{progress}%</span>
          </div>

          {/* 하단: 담당자 + 관리 버튼 + 최종 수정일 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MemberAvatarGroup members={members} />
              {onManageMembers && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.preventDefault();
                    onManageMembers(project.id);
                  }}
                >
                  <Users className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <CardDescription className="text-xs">
              수정: {new Date(project.updatedAt).toLocaleDateString('ko-KR')}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
