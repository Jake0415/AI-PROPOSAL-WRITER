'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, GitCompare, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface Version {
  id: string;
  versionNumber: number;
  label: string;
  createdAt: string;
}

interface CompareResult {
  version1: { versionNumber: number; label: string; createdAt: string };
  version2: { versionNumber: number; label: string; createdAt: string };
  changes: Array<{ field: string; v1Summary: string; v2Summary: string }>;
  totalChanges: number;
}

export default function VersionsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [versions, setVersions] = useState<Version[]>([]);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [selectedV1, setSelectedV1] = useState('');
  const [selectedV2, setSelectedV2] = useState('');

  const fetchVersions = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/versions`);
      const data = await res.json();
      if (data.success) setVersions(data.data);
    } catch { /* 무시 */ }
  }, [projectId]);

  useEffect(() => { fetchVersions(); }, [fetchVersions]);

  async function saveVersion() {
    if (!label.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setLabel('');
        fetchVersions();
      }
    } catch { /* 무시 */ }
    setSaving(false);
  }

  async function compareVersions() {
    if (!selectedV1 || !selectedV2 || selectedV1 === selectedV2) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/versions/compare?v1=${selectedV1}&v2=${selectedV2}`);
      const data = await res.json();
      if (data.success) setCompareResult(data.data);
    } catch { /* 무시 */ }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">버전 관리</h2>
        <p className="text-muted-foreground mt-1">
          제안서의 상태를 버전별로 저장하고 비교합니다
        </p>
      </div>

      {/* 새 버전 저장 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">새 버전 저장</CardTitle>
          <div className="flex gap-2 mt-2">
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="버전 라벨 (예: 초안, 1차 수정, 최종본)"
              className="flex-1 h-9 rounded-md border bg-background px-3 text-sm"
              onKeyDown={e => e.key === 'Enter' && saveVersion()}
            />
            <Button onClick={saveVersion} disabled={saving || !label.trim()} size="sm">
              <Save className="mr-2 h-4 w-4" />
              {saving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* 버전 비교 */}
      {versions.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">버전 비교</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <select
                value={selectedV1}
                onChange={e => setSelectedV1(e.target.value)}
                className="h-9 rounded-md border bg-background px-2 text-sm"
              >
                <option value="">버전 1 선택</option>
                {versions.map(v => (
                  <option key={v.id} value={v.id}>v{v.versionNumber} - {v.label}</option>
                ))}
              </select>
              <GitCompare className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedV2}
                onChange={e => setSelectedV2(e.target.value)}
                className="h-9 rounded-md border bg-background px-2 text-sm"
              >
                <option value="">버전 2 선택</option>
                {versions.map(v => (
                  <option key={v.id} value={v.id}>v{v.versionNumber} - {v.label}</option>
                ))}
              </select>
              <Button size="sm" variant="outline" onClick={compareVersions}
                disabled={!selectedV1 || !selectedV2 || selectedV1 === selectedV2}
              >
                비교
              </Button>
            </div>

            {compareResult && (
              <div className="mt-4 space-y-2">
                <div className="text-sm text-muted-foreground">
                  v{compareResult.version1.versionNumber} ({compareResult.version1.label}) vs
                  v{compareResult.version2.versionNumber} ({compareResult.version2.label})
                  — {compareResult.totalChanges}개 항목 변경
                </div>
                {compareResult.changes.map((change, i) => (
                  <div key={i} className="rounded-md border p-3 text-xs">
                    <Badge variant="outline" className="mb-1">{change.field}</Badge>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div className="bg-red-50 dark:bg-red-950/20 rounded p-2 truncate">{change.v1Summary}</div>
                      <div className="bg-green-50 dark:bg-green-950/20 rounded p-2 truncate">{change.v2Summary}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardHeader>
        </Card>
      )}

      {/* 버전 타임라인 */}
      {versions.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>저장된 버전이 없습니다</CardTitle>
            <CardDescription>현재 상태를 저장하여 버전 관리를 시작하세요</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-2">
          {versions.map(v => (
            <Card key={v.id}>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    v{v.versionNumber}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm">{v.label}</CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(v.createdAt).toLocaleString('ko-KR')}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                  >
                    {expandedId === v.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
