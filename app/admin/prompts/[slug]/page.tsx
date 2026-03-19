'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, RotateCcw, Play, Loader2, History } from 'lucide-react';

interface PromptDetail {
  slug: string;
  name: string;
  description: string;
  category: string;
  systemPrompt: string;
  userPromptTemplate: string;
  maxTokens: number;
  version: number;
  source: 'db' | 'default';
  defaultSystemPrompt?: string;
}

interface VersionEntry {
  id: string;
  version: number;
  changeNote: string;
  createdAt: string;
}

export default function PromptEditPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [data, setData] = useState<PromptDetail | null>(null);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userPromptTemplate, setUserPromptTemplate] = useState('');
  const [maxTokens, setMaxTokens] = useState(4096);
  const [changeNote, setChangeNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [message, setMessage] = useState('');
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/admin/prompts/${slug}`);
    const json = await res.json();
    if (json.success) {
      setData(json.data);
      setSystemPrompt(json.data.systemPrompt);
      setUserPromptTemplate(json.data.userPromptTemplate ?? '');
      setMaxTokens(json.data.maxTokens);
    }
  }, [slug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/prompts/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPromptTemplate, maxTokens, changeNote }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage('저장되었습니다');
        setChangeNote('');
        fetchData();
      } else {
        setMessage(json.error?.message ?? '저장에 실패했습니다');
      }
    } catch {
      setMessage('네트워크 오류');
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!confirm('기본값으로 복원하시겠습니까? 커스텀 설정이 삭제됩니다.')) return;
    try {
      const res = await fetch(`/api/admin/prompts/${slug}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setMessage('기본값으로 복원되었습니다');
        fetchData();
      }
    } catch {
      setMessage('복원에 실패했습니다');
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult('');
    try {
      const res = await fetch(`/api/admin/prompts/${slug}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          userPrompt: '테스트 입력: 간단한 RFP 분석 요청입니다. 짧게 응답해주세요.',
          maxTokens: 512,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setTestResult(json.data.response);
      } else {
        setTestResult(`오류: ${json.error?.message}`);
      }
    } catch {
      setTestResult('테스트 실행에 실패했습니다');
    } finally {
      setTesting(false);
    }
  }

  async function loadVersions() {
    setShowVersions(!showVersions);
    if (!showVersions) {
      const res = await fetch(`/api/admin/prompts/${slug}/versions`);
      const json = await res.json();
      if (json.success) setVersions(json.data);
    }
  }

  async function handleRevert(version: number) {
    if (!confirm(`v${version}으로 되돌리시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/admin/prompts/${slug}/revert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage(`v${version}으로 되돌렸습니다`);
        fetchData();
        loadVersions();
      }
    } catch {
      setMessage('되돌리기에 실패했습니다');
    }
  }

  if (!data) return <div className="p-8 text-center text-muted-foreground">로딩 중...</div>;

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/prompts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{data.name}</h1>
            <p className="text-sm text-muted-foreground">{data.description}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline">v{data.version}</Badge>
            <Badge variant={data.source === 'db' ? 'secondary' : 'outline'}>
              {data.source === 'db' ? '커스텀' : '기본값'}
            </Badge>
          </div>
        </div>

        {message && (
          <p className={`text-sm ${message.includes('실패') || message.includes('오류') ? 'text-destructive' : 'text-green-600'}`}>
            {message}
          </p>
        )}

        {/* System Prompt */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">System Prompt</CardTitle>
            <CardDescription className="text-xs">AI의 역할과 지시사항을 정의합니다</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full h-64 p-3 text-sm font-mono bg-muted/50 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="System Prompt를 입력하세요..."
            />
          </div>
        </Card>

        {/* User Prompt Template */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">User Prompt Template (선택)</CardTitle>
            <CardDescription className="text-xs">
              {'{{variable}} 형태의 플레이스홀더를 사용하세요. 비워두면 코드 기본 함수를 사용합니다.'}
            </CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <textarea
              value={userPromptTemplate}
              onChange={(e) => setUserPromptTemplate(e.target.value)}
              className="w-full h-40 p-3 text-sm font-mono bg-muted/50 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="비워두면 코드 기본 함수를 사용합니다..."
            />
          </div>
        </Card>

        {/* Settings Row */}
        <div className="flex items-end gap-4">
          <div>
            <label className="text-sm font-medium">Max Tokens</label>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              className="mt-1 block w-32 h-9 px-3 text-sm border rounded-md bg-background"
              min={256}
              max={32768}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">변경 메모</label>
            <input
              type="text"
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              className="mt-1 block w-full h-9 px-3 text-sm border rounded-md bg-background"
              placeholder="변경 사유를 입력하세요 (선택)"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            저장
          </Button>
          <Button variant="outline" onClick={handleTest} disabled={testing}>
            {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            테스트
          </Button>
          <Button variant="outline" onClick={loadVersions}>
            <History className="mr-2 h-4 w-4" />
            버전 이력
          </Button>
          {data.source === 'db' && (
            <Button variant="destructive" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              기본값 복원
            </Button>
          )}
        </div>

        {/* Test Result */}
        {testResult && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">테스트 결과</CardTitle>
            </CardHeader>
            <div className="px-6 pb-6">
              <pre className="text-xs font-mono bg-muted/50 p-3 rounded-md whitespace-pre-wrap max-h-64 overflow-auto">
                {testResult}
              </pre>
            </div>
          </Card>
        )}

        {/* Version History */}
        {showVersions && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">버전 이력</CardTitle>
            </CardHeader>
            <div className="px-6 pb-6">
              {versions.length === 0 ? (
                <p className="text-sm text-muted-foreground">아직 변경 이력이 없습니다</p>
              ) : (
                <div className="space-y-2">
                  {versions.map((v) => (
                    <div key={v.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <span className="text-sm font-medium">v{v.version}</span>
                        {v.changeNote && (
                          <span className="text-xs text-muted-foreground ml-2">{v.changeNote}</span>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(v.createdAt).toLocaleString('ko-KR')}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRevert(v.version)}>
                        <RotateCcw className="mr-1 h-3 w-3" />
                        되돌리기
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
