'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, FileText, Clock, CheckCircle2 } from 'lucide-react';
import { ProjectCard } from '@/components/project/project-card';
import { ProjectFilterBar } from '@/components/project/project-filter-bar';
import { ProjectTable } from '@/components/project/project-table';
import { MemberManageDialog } from '@/components/project/member-manage-dialog';
import type { EnhancedProject } from '@/components/project/types';

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

export default function DashboardPage() {
  const [projects, setProjects] = useState<EnhancedProject[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [canManageMembers, setCanManageMembers] = useState(false);
  const [memberDialogProjectId, setMemberDialogProjectId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      params.set('limit', '50');

      const res = await fetch(`/api/projects?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.data ?? []);
        if (data.meta) setMeta(data.meta);
      }
    } catch {
      // API 오류 무시
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // 현재 사용자 권한 확인 (proposal_pm 이상이면 담당자 관리 가능)
  useEffect(() => {
    async function checkRole() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          const role = data.data?.role;
          const pmRoles = ['super_admin', 'admin', 'proposal_pm'];
          setCanManageMembers(pmRoles.includes(role));
        }
      } catch {
        // 무시
      }
    }
    checkRole();
  }, []);

  async function handleCreate() {
    if (!newTitle.trim()) return;
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      if (res.ok) {
        setNewTitle('');
        setIsCreating(false);
        fetchProjects();
      }
    } catch {
      // 에러 처리
    }
  }

  const inProgress = projects.filter((p) => p.status !== 'completed').length;
  const completed = projects.filter((p) => p.status === 'completed').length;

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
          <p className="text-muted-foreground mt-1">
            RFP를 업로드하고 AI가 제안서를 자동 생성합니다
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />새 프로젝트
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">전체 프로젝트</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <div className="px-6 pb-4">
            <div className="text-2xl font-bold">{meta.total}</div>
          </div>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">진행 중</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <div className="px-6 pb-4">
            <div className="text-2xl font-bold">{inProgress}</div>
          </div>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">완료</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <div className="px-6 pb-4">
            <div className="text-2xl font-bold">{completed}</div>
          </div>
        </Card>
      </div>

      {/* 새 프로젝트 생성 폼 */}
      {isCreating && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>새 프로젝트 생성</CardTitle>
            <CardDescription>제안서를 작성할 프로젝트 제목을 입력하세요</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6 flex gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="예: 2026년 공공 클라우드 전환 사업 제안"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              autoFocus
            />
            <Button onClick={handleCreate}>생성</Button>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              취소
            </Button>
          </div>
        </Card>
      )}

      {/* 필터/검색 바 */}
      <ProjectFilterBar
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        onStatusChange={setStatusFilter}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 프로젝트 목록 */}
      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>프로젝트가 없습니다</CardTitle>
            <CardDescription>
              새 프로젝트를 생성하고 RFP를 업로드하여 제안서 작성을 시작하세요
            </CardDescription>
          </CardHeader>
        </Card>
      ) : viewMode === 'table' ? (
        <ProjectTable
          projects={projects}
          onManageMembers={canManageMembers ? (id) => setMemberDialogProjectId(id) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              statusLabel={STATUS_LABELS[project.status] ?? project.status}
              onManageMembers={canManageMembers ? (id) => setMemberDialogProjectId(id) : undefined}
            />
          ))}
        </div>
      )}

      {/* 담당자 관리 Dialog */}
      {memberDialogProjectId && (
        <MemberManageDialog
          projectId={memberDialogProjectId}
          open={!!memberDialogProjectId}
          onOpenChange={(open) => {
            if (!open) setMemberDialogProjectId(null);
          }}
          onMembersChanged={fetchProjects}
        />
      )}
    </div>
  );
}
