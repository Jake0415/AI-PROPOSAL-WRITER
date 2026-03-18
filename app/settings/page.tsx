'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bot, Check, Loader2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AiSettingsData {
  provider: 'claude' | 'gpt';
  claudeModel: string;
  gptModel: string;
  hasClaudeKey: boolean;
  hasGptKey: boolean;
}

const PROVIDERS = [
  {
    id: 'claude' as const,
    name: 'Claude (Anthropic)',
    description: 'Claude Sonnet 4.6 기반. 한국어 이해도와 구조화된 JSON 출력에 강점.',
    icon: Bot,
    models: ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
    keyField: 'hasClaudeKey' as const,
  },
  {
    id: 'gpt' as const,
    name: 'GPT (OpenAI)',
    description: 'GPT-4o 기반. JSON 모드 지원으로 안정적인 구조화 출력.',
    icon: Zap,
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    keyField: 'hasGptKey' as const,
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<AiSettingsData | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    provider: string;
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings/ai');
      const data = await res.json();
      if (data.success) setSettings(data.data);
    } catch {
      // 설정 로드 실패
    }
  }

  async function selectProvider(provider: 'claude' | 'gpt') {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/settings/ai', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (data.success) {
        setSettings((prev) => prev ? { ...prev, provider } : null);
      }
    } catch {
      // 저장 실패
    } finally {
      setSaving(false);
    }
  }

  async function selectModel(field: 'claudeModel' | 'gptModel', model: string) {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/settings/ai', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: model }),
      });
      const data = await res.json();
      if (data.success) {
        setSettings((prev) => prev ? { ...prev, [field]: model } : null);
      }
    } catch {
      // 저장 실패
    } finally {
      setSaving(false);
    }
  }

  async function testConnection(provider: 'claude' | 'gpt') {
    setTesting(provider);
    setTestResult(null);
    try {
      const res = await fetch('/api/settings/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      setTestResult({
        provider,
        success: data.success,
        message: data.success ? '연결 성공' : data.error?.message ?? '연결 실패',
      });
    } catch {
      setTestResult({ provider, success: false, message: '네트워크 오류' });
    } finally {
      setTesting(null);
    }
  }

  if (!settings) {
    return (
      <div className="container mx-auto max-w-screen-2xl px-4 py-8">
        <p className="text-muted-foreground">설정을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* 헤더 */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI 설정</h1>
          <p className="mt-2 text-muted-foreground">
            제안서 생성에 사용할 AI 프로바이더와 모델을 선택하세요.
          </p>
        </div>

        {/* 프로바이더 선택 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">프로바이더 선택</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROVIDERS.map((p) => {
              const isActive = settings.provider === p.id;
              const hasKey = settings[p.keyField];
              const Icon = p.icon;

              return (
                <Card
                  key={p.id}
                  className={cn(
                    'cursor-pointer transition-all',
                    isActive
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'hover:border-primary/50',
                  )}
                  onClick={() => selectProvider(p.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {isActive ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        <CardTitle className="text-base">{p.name}</CardTitle>
                      </div>
                      <Badge variant={hasKey ? 'default' : 'destructive'}>
                        {hasKey ? 'API 키 설정됨' : 'API 키 없음'}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2 text-xs">
                      {p.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* 모델 선택 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">모델 선택</h2>
          {PROVIDERS.map((p) => {
            const isActiveProvider = settings.provider === p.id;
            const currentModel =
              p.id === 'claude' ? settings.claudeModel : settings.gptModel;
            const modelField =
              p.id === 'claude' ? 'claudeModel' : 'gptModel';

            return (
              <div
                key={p.id}
                className={cn(
                  'space-y-2',
                  !isActiveProvider && 'opacity-50',
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{p.name}</span>
                  {isActiveProvider && (
                    <Badge variant="outline" className="text-[10px]">
                      활성
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.models.map((model) => (
                    <Button
                      key={model}
                      variant={currentModel === model ? 'default' : 'outline'}
                      size="sm"
                      disabled={saving}
                      onClick={() =>
                        selectModel(
                          modelField as 'claudeModel' | 'gptModel',
                          model,
                        )
                      }
                    >
                      {model}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* 연결 테스트 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">연결 테스트</h2>
          <div className="flex gap-3">
            {PROVIDERS.map((p) => (
              <Button
                key={p.id}
                variant="outline"
                size="sm"
                disabled={testing !== null}
                onClick={() => testConnection(p.id)}
              >
                {testing === p.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <p.icon className="mr-2 h-4 w-4" />
                )}
                {p.name} 테스트
              </Button>
            ))}
          </div>
          {testResult && (
            <div
              className={cn(
                'rounded-lg border p-3 text-sm',
                testResult.success
                  ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
                  : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300',
              )}
            >
              <span className="font-medium">
                {testResult.provider.toUpperCase()}:
              </span>{' '}
              {testResult.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
