'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Search, Shield } from 'lucide-react';

interface AuditLog {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
}

const ACTION_LABELS: Record<string, string> = {
  'login': '로그인',
  'logout': '로그아웃',
  'project.create': '프로젝트 생성',
  'project.update': '프로젝트 수정',
  'project.delete': '프로젝트 삭제',
  'rfp.upload': 'RFP 업로드',
  'rfp.analyze': 'RFP 분석',
  'direction.generate': '방향성 생성',
  'direction.select': '방향성 선택',
  'strategy.generate': '전략 생성',
  'outline.generate': '목차 생성',
  'outline.update': '목차 수정',
  'section.generate': '섹션 생성',
  'section.update': '섹션 수정',
  'review.generate': '검토 생성',
  'price.generate': '가격 생성',
  'output.download': '산출물 다운로드',
  'template.upload': '템플릿 업로드',
  'template.delete': '템플릿 삭제',
  'user.create': '사용자 생성',
  'user.update': '사용자 수정',
  'user.delete': '사용자 삭제',
  'settings.update': '설정 변경',
};

const RESOURCE_COLORS: Record<string, string> = {
  auth: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  project: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  rfp: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  output: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  user: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  settings: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 50, total: 0 });
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');

  const fetchLogs = useCallback(async (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (actionFilter) params.set('action', actionFilter);
    if (resourceFilter) params.set('resourceType', resourceFilter);

    try {
      const res = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
        setMeta(data.meta);
      }
    } catch { /* 무시 */ }
  }, [actionFilter, resourceFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(meta.total / meta.limit) || 1;

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">감사 로그</h1>
            <p className="text-muted-foreground text-sm">
              시스템 활동 기록 ({meta.total.toLocaleString()}건)
            </p>
          </div>
        </div>

        {/* 필터 */}
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Search className="h-4 w-4 text-muted-foreground" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="h-8 rounded-md border bg-background px-2 text-xs"
              >
                <option value="">전체 활동</option>
                {Object.entries(ACTION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <select
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                className="h-8 rounded-md border bg-background px-2 text-xs"
              >
                <option value="">전체 리소스</option>
                <option value="auth">인증</option>
                <option value="project">프로젝트</option>
                <option value="rfp">RFP</option>
                <option value="output">산출물</option>
                <option value="user">사용자</option>
                <option value="settings">설정</option>
              </select>
              <Button variant="outline" size="sm" onClick={() => fetchLogs()}>
                검색
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* 로그 목록 */}
        {logs.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader className="text-center py-12">
              <CardTitle className="text-base">감사 로그가 없습니다</CardTitle>
              <CardDescription>시스템 활동이 기록되면 여기에 표시됩니다</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <Card key={log.id} className="hover:bg-muted/30 transition-colors">
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ${RESOURCE_COLORS[log.resourceType] || ''}`}
                      >
                        {log.resourceType}
                      </Badge>
                      <span className="text-sm font-medium truncate">
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                      {log.resourceId && (
                        <span className="text-xs text-muted-foreground truncate">
                          {log.resourceId.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                      <span>{log.userName || '시스템'}</span>
                      {log.ipAddress && <span>{log.ipAddress}</span>}
                      <span>{new Date(log.createdAt).toLocaleString('ko-KR')}</span>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => fetchLogs(meta.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {meta.page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= totalPages}
              onClick={() => fetchLogs(meta.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
