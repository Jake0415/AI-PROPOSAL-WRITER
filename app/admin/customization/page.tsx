'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Save, RotateCcw, FileText } from 'lucide-react';

interface TenantSettings {
  appName: string;
  logoUrl: string;
  primaryColor: string;
}

const DEFAULTS: TenantSettings = {
  appName: 'AIPROWRITER',
  logoUrl: '',
  primaryColor: '',
};

export default function CustomizationPage() {
  const [settings, setSettings] = useState<TenantSettings>(DEFAULTS);
  const [original, setOriginal] = useState<TenantSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/tenant');
      const data = await res.json();
      if (data.success) {
        const s = {
          appName: data.data.appName || DEFAULTS.appName,
          logoUrl: data.data.logoUrl || '',
          primaryColor: data.data.primaryColor || '',
        };
        setSettings(s);
        setOriginal(s);
      }
    } catch { /* 기본값 유지 */ }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(original);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/settings/tenant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setOriginal(settings);
        setMessage('저장되었습니다. 페이지를 새로고침하면 반영됩니다.');
      } else {
        setMessage(data.error?.message || '저장에 실패했습니다');
      }
    } catch {
      setMessage('네트워크 오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setSettings(DEFAULTS);
  }

  return (
    <div className="container mx-auto max-w-screen-md py-8 px-4 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">회사별 커스터마이징</h2>
        <p className="text-muted-foreground mt-1">
          앱 이름, 로고, 테마 색상을 설정합니다
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">브랜딩 설정</CardTitle>
          <CardDescription>앱 이름과 로고를 변경합니다</CardDescription>
        </CardHeader>
        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName">앱 이름</Label>
            <Input
              id="appName"
              value={settings.appName}
              onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
              placeholder="AIPROWRITER"
            />
            <p className="text-xs text-muted-foreground">내비게이션 바와 로그인 페이지에 표시됩니다</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">로고 URL</Label>
            <Input
              id="logoUrl"
              value={settings.logoUrl}
              onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
              placeholder="/logo.svg 또는 https://..."
            />
            <p className="text-xs text-muted-foreground">비워두면 기본 아이콘이 표시됩니다</p>
          </div>

          {/* 미리보기 */}
          <div className="rounded-lg border p-4 bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">미리보기</p>
            <div className="flex items-center space-x-2">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="로고" className="h-5 w-5 object-contain" />
              ) : (
                <FileText className="h-5 w-5 text-primary" />
              )}
              <span className="font-bold text-sm">{settings.appName || 'AIPROWRITER'}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">테마 색상</CardTitle>
          <CardDescription>기본 색상을 변경합니다</CardDescription>
        </CardHeader>
        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">기본 색상 (HEX)</Label>
            <div className="flex items-center gap-3">
              <Input
                id="primaryColor"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                placeholder="#1a1a1a"
                className="flex-1"
              />
              <input
                type="color"
                value={settings.primaryColor || '#1a1a1a'}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="h-9 w-12 rounded border cursor-pointer"
              />
            </div>
            <p className="text-xs text-muted-foreground">비워두면 기본 테마 색상을 사용합니다</p>
          </div>

          {settings.primaryColor && (
            <div className="rounded-lg border p-4 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2">색상 미리보기</p>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded" style={{ backgroundColor: settings.primaryColor }} />
                <span className="text-sm font-mono">{settings.primaryColor}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Separator />

      {message && (
        <p className={`text-sm ${message.includes('실패') || message.includes('오류') ? 'text-destructive' : 'text-green-600'}`}>
          {message}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving || !hasChanges}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? '저장 중...' : '저장'}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          기본값으로 초기화
        </Button>
      </div>
    </div>
  );
}
