import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  statusLabel: string;
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  uploaded: 'outline',
  analyzing: 'secondary',
  direction_set: 'secondary',
  strategy_set: 'secondary',
  outline_ready: 'secondary',
  generating: 'secondary',
  completed: 'default',
};

export function ProjectCard({ project, statusLabel }: ProjectCardProps) {
  const href =
    project.status === 'uploaded'
      ? `/projects/${project.id}/upload`
      : `/projects/${project.id}/analysis`;

  return (
    <Link href={href}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant={STATUS_VARIANT[project.status] ?? 'outline'}>
              {statusLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(project.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
          <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
          <CardDescription className="text-xs">
            최종 수정: {new Date(project.updatedAt).toLocaleDateString('ko-KR')}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
