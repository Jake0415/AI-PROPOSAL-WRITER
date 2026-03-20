'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { MemberAvatarGroup } from './member-avatar-group';
import { getProjectProgress } from '@/lib/utils/progress';
import type { ProjectStatus } from '@/lib/db/schema';
import type { EnhancedProject } from './types';

const STATUS_LABELS: Record<string, string> = {
  uploaded: 'RFP 업로드됨',
  analyzing: '분석 중',
  direction_set: '방향 설정됨',
  strategy_set: '전략 수립됨',
  outline_ready: '목차 구성됨',
  generating: '내용 생성 중',
  sections_ready: '섹션 완료',
  reviewing: '검토 중',
  completed: '완료',
};

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

interface ProjectTableProps {
  projects: EnhancedProject[];
  onManageMembers?: (projectId: string) => void;
}

export function ProjectTable({ projects, onManageMembers }: ProjectTableProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[280px]">프로젝트명</TableHead>
            <TableHead>고객</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>담당자</TableHead>
            <TableHead>예산</TableHead>
            <TableHead className="w-[120px]">진행률</TableHead>
            <TableHead>생성일</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                프로젝트가 없습니다
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => {
              const progress = getProjectProgress(project.status as ProjectStatus);
              const href =
                project.status === 'uploaded'
                  ? `/projects/${project.id}/upload`
                  : `/projects/${project.id}/analysis`;

              return (
                <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Link href={href} className="font-medium hover:underline line-clamp-1">
                      {project.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {project.rfpAnalysis?.client ?? '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[project.status] ?? 'outline'} className="text-xs">
                      {STATUS_LABELS[project.status] ?? project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {onManageMembers ? (
                      <button
                        onClick={() => onManageMembers(project.id)}
                        className="hover:opacity-80"
                      >
                        <MemberAvatarGroup
                          members={(project.members ?? []).map((m) => ({
                            name: m.user.name,
                            avatarUrl: m.user.avatarUrl,
                            role: m.role,
                          }))}
                        />
                      </button>
                    ) : (
                      <MemberAvatarGroup
                        members={(project.members ?? []).map((m) => ({
                          name: m.user.name,
                          avatarUrl: m.user.avatarUrl,
                          role: m.role,
                        }))}
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {project.rfpAnalysis?.budget ?? '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={progress} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-8">{progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString('ko-KR')}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
