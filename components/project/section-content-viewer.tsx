'use client';

import { useState, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Save, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface SectionContentViewerProps {
  content: string;
  diagrams?: unknown[];
  onSave: (content: string) => void;
  renderPrettyPrint?: (content: string) => React.ReactNode;
}

export function SectionContentViewer({ content, onSave, renderPrettyPrint }: SectionContentViewerProps) {
  const [mdText, setMdText] = useState(content);
  const [jsonText, setJsonText] = useState(() => JSON.stringify({ content }, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [mdDirty, setMdDirty] = useState(false);
  const [jsonDirty, setJsonDirty] = useState(false);

  const handleMdChange = useCallback((value: string) => {
    setMdText(value);
    setMdDirty(true);
  }, []);

  const handleJsonChange = useCallback((value: string) => {
    setJsonText(value);
    setJsonDirty(true);
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (e) {
      setJsonError((e as Error).message);
    }
  }, []);

  function saveMd() {
    onSave(mdText);
    setMdDirty(false);
  }

  function saveJson() {
    try {
      const parsed = JSON.parse(jsonText);
      onSave(parsed.content ?? mdText);
      setJsonDirty(false);
      setJsonError(null);
    } catch (e) {
      setJsonError((e as Error).message);
    }
  }

  return (
    <Tabs defaultValue="pretty" className="w-full">
      <TabsList className="grid w-full grid-cols-3 h-8">
        <TabsTrigger value="pretty" className="text-xs">Pretty Print</TabsTrigger>
        <TabsTrigger value="markdown" className="text-xs">마크다운 편집</TabsTrigger>
        <TabsTrigger value="json" className="text-xs">JSON 편집</TabsTrigger>
      </TabsList>

      <TabsContent value="pretty" className="mt-2">
        <div className="rounded-md border bg-background p-4 max-h-96 overflow-y-auto">
          {renderPrettyPrint ? renderPrettyPrint(content) : (
            <div className="prose prose-sm dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="markdown" className="mt-2 space-y-2">
        <textarea
          value={mdText}
          onChange={(e) => handleMdChange(e.target.value)}
          className="w-full h-80 p-3 text-xs font-mono bg-muted/30 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          spellCheck={false}
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={saveMd} disabled={!mdDirty} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            저장
          </Button>
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
          <Button size="sm" onClick={saveJson} disabled={!!jsonError || !jsonDirty} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            저장
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
