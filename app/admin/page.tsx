'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FolderOpen, FileText, Activity } from 'lucide-react';

interface AdminStats {
  totalProjects: number;
  projectsByStatus: Record<string, number>;
  recentProjects: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
  }>;
}

const STATUS_LABELS: Record<string, string> = {
  uploaded: '업로드됨',
  analyzing: '분석 중',
  direction_set: '방향 설정',
  strategy_set: '전략 수립',
  outline_ready: '목차 완료',
  generating: '생성 중',
  completed: '완료',
};

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setStats(data.data);
      }
    } catch {
      // 통계 로드 실패
    }
  }

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">관리자 대시보드</h1>
          <p className="mt-2 text-muted-foreground">
            프로젝트 현황과 시스템 상태를 한눈에 확인합니다.
          </p>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                전체 프로젝트
              </CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <div className="px-6 pb-4">
              <div className="text-3xl font-bold">
                {stats?.totalProjects ?? '-'}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                완료된 프로젝트
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <div className="px-6 pb-4">
              <div className="text-3xl font-bold">
                {stats?.projectsByStatus?.completed ?? 0}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                진행 중
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <div className="px-6 pb-4">
              <div className="text-3xl font-bold">
                {(stats?.totalProjects ?? 0) -
                  (stats?.projectsByStatus?.completed ?? 0)}
              </div>
            </div>
          </Card>
        </div>

        {/* 상태별 분포 */}
        {stats?.projectsByStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">상태별 분포</CardTitle>
            </CardHeader>
            <div className="px-6 pb-6 flex flex-wrap gap-3">
              {Object.entries(stats.projectsByStatus).map(([status, count]) => (
                <Badge key={status} variant="outline" className="text-sm py-1 px-3">
                  {STATUS_LABELS[status] ?? status}: {count}개
                </Badge>
              ))}
            </div>
          </Card>
        )}

        <Separator />

        {/* 최근 프로젝트 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">최근 프로젝트</CardTitle>
            <CardDescription>최근 생성된 프로젝트 목록</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            {stats?.recentProjects && stats.recentProjects.length > 0 ? (
              <div className="space-y-3">
                {stats.recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{project.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(project.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {STATUS_LABELS[project.status] ?? project.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">프로젝트가 없습니다.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
