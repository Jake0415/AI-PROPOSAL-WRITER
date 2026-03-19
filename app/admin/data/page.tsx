'use client';

import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, Loader2, Database, AlertTriangle } from 'lucide-react';

export default function DataManagementPage() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    setExporting(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/export', { method: 'POST' });
      if (!res.ok) throw new Error('내보내기 실패');

      const blob = await res.blob();
      const cd = res.headers.get('Content-Disposition');
      let filename = `backup_${new Date().toISOString().slice(0, 10)}.json`;
      if (cd) {
        const match = cd.match(/filename\*=UTF-8''(.+)/);
        if (match) filename = decodeURIComponent(match[1]);
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage('백업 파일이 다운로드되었습니다');
      setIsError(false);
    } catch {
      setMessage('데이터 내보내기에 실패했습니다');
      setIsError(true);
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('기존 프로젝트 데이터가 모두 삭제되고 백업 데이터로 교체됩니다. 계속하시겠습니까?')) {
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    setImporting(true);
    setMessage('');

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`복구 완료: ${data.data.imported}건 가져옴 (원본 백업: ${data.data.exportedAt})`);
        setIsError(false);
      } else {
        setMessage(data.error?.message || '가져오기에 실패했습니다');
        setIsError(true);
      }
    } catch {
      setMessage('파일을 읽을 수 없습니다. JSON 백업 파일인지 확인하세요.');
      setIsError(true);
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">데이터 관리</h1>
            <p className="text-muted-foreground text-sm">
              프로젝트 데이터 백업 및 복구
            </p>
          </div>
        </div>

        {message && (
          <Card className={isError ? 'border-destructive' : 'border-green-500'}>
            <CardHeader className="py-3">
              <CardDescription className={isError ? 'text-destructive' : 'text-green-600'}>
                {message}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 내보내기 */}
          <Card>
            <CardHeader className="text-center py-8">
              <Download className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-base">데이터 내보내기</CardTitle>
              <CardDescription className="mb-4">
                전체 프로젝트 데이터를 JSON 파일로 백업합니다.
                <br />
                <span className="text-xs">프로젝트, RFP 분석, 목차, 섹션, 검토, 가격 포함</span>
              </CardDescription>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={exporting || importing}
              >
                {exporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {exporting ? '내보내는 중...' : 'JSON 내보내기'}
              </Button>
            </CardHeader>
          </Card>

          {/* 가져오기 */}
          <Card>
            <CardHeader className="text-center py-8">
              <Upload className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle className="text-base">데이터 가져오기</CardTitle>
              <CardDescription className="mb-4">
                백업 JSON 파일에서 데이터를 복구합니다.
                <br />
                <span className="text-xs flex items-center justify-center gap-1 text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  기존 프로젝트 데이터가 교체됩니다
                </span>
              </CardDescription>
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={exporting || importing}
              >
                {importing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {importing ? '가져오는 중...' : 'JSON 가져오기'}
              </Button>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-muted">
          <CardHeader className="py-4">
            <CardDescription className="text-xs text-center">
              Docker PostgreSQL 자동 백업: Docker 볼륨에 데이터가 보관됩니다.
              <br />
              정기 백업이 필요하면 pg_dump 스크립트를 cron에 등록하세요.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
