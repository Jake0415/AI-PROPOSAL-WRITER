'use client';

import { useState, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, AlertCircle } from 'lucide-react';

interface StepResultViewerProps {
  result: Record<string, unknown>;
  onSave: (updated: Record<string, unknown>) => void;
}

export function StepResultViewer({ result, onSave }: StepResultViewerProps) {
  const [jsonText, setJsonText] = useState(() => JSON.stringify(result, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const handleJsonChange = useCallback((value: string) => {
    setJsonText(value);
    setIsDirty(true);
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (e) {
      setJsonError((e as Error).message);
    }
  }, []);

  function handleSave() {
    try {
      const parsed = JSON.parse(jsonText);
      onSave(parsed);
      setIsDirty(false);
      setJsonError(null);
    } catch (e) {
      setJsonError((e as Error).message);
    }
  }

  return (
    <Tabs defaultValue="pretty" className="w-full">
      <TabsList className="grid w-full grid-cols-2 h-8">
        <TabsTrigger value="pretty" className="text-xs">Pretty Print</TabsTrigger>
        <TabsTrigger value="json" className="text-xs">JSON 편집</TabsTrigger>
      </TabsList>

      <TabsContent value="pretty" className="mt-2">
        <div className="rounded-md border bg-muted/30 p-4 max-h-96 overflow-y-auto">
          <PrettyPrint data={result} />
        </div>
      </TabsContent>

      <TabsContent value="json" className="mt-2 space-y-2">
        <textarea
          value={jsonText}
          onChange={(e) => handleJsonChange(e.target.value)}
          className={`w-full h-80 p-3 text-xs font-mono bg-muted/30 border rounded-md resize-y focus:outline-none focus:ring-2 ${
            jsonError ? 'border-destructive focus:ring-destructive' : 'focus:ring-ring'
          }`}
          spellCheck={false}
        />
        {jsonError && (
          <div className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{jsonError}</span>
          </div>
        )}
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!!jsonError || !isDirty}
            className="gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            저장
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function PrettyPrint({ data, depth = 0 }: { data: unknown; depth?: number }) {
  if (data === null || data === undefined) {
    return <span className="text-muted-foreground text-sm italic">없음</span>;
  }

  if (typeof data === 'string') {
    return <span className="text-sm whitespace-pre-wrap">{data}</span>;
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return <Badge variant="outline" className="text-xs font-mono">{String(data)}</Badge>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-muted-foreground text-sm italic">빈 목록</span>;
    }

    // 문자열 배열이면 간단한 리스트
    if (data.every(item => typeof item === 'string')) {
      return (
        <ul className="space-y-0.5 pl-4 list-disc">
          {data.map((item, i) => (
            <li key={i} className="text-sm">{item as string}</li>
          ))}
        </ul>
      );
    }

    // 객체 배열이면 번호 카드
    return (
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="rounded border bg-background p-2.5">
            <div className="text-xs text-muted-foreground mb-1">#{i + 1}</div>
            <PrettyPrint data={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length === 0) {
      return <span className="text-muted-foreground text-sm italic">빈 객체</span>;
    }

    return (
      <div className={`space-y-2 ${depth > 0 ? 'pl-3 border-l-2 border-muted' : ''}`}>
        {entries.map(([key, value]) => (
          <div key={key}>
            <div className="text-xs font-semibold text-muted-foreground mb-0.5">{key}</div>
            <PrettyPrint data={value} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  return <span className="text-sm">{String(data)}</span>;
}
