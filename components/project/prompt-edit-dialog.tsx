'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Play } from 'lucide-react';

interface PromptEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  stepNumber: number;
  onRerun: () => void;
}

interface PromptData {
  systemPrompt: string;
  userPromptTemplate: string;
  maxTokens: number;
}

export function PromptEditDialog({
  open, onOpenChange, slug, stepNumber, onRerun,
}: PromptEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prompt, setPrompt] = useState<PromptData | null>(null);

  useEffect(() => {
    if (!open || !slug) return;
    setLoading(true);
    fetch(`/api/admin/prompts/${slug}`)
      .then(res => res.json())
      .then(data => {
        const p = data.data ?? data;
        setPrompt({
          systemPrompt: p.systemPrompt ?? '',
          userPromptTemplate: p.userPromptTemplate ?? '',
          maxTokens: p.maxTokens ?? 4096,
        });
      })
      .catch(() => setPrompt(null))
      .finally(() => setLoading(false));
  }, [open, slug]);

  async function handleSave(andRerun = false) {
    if (!prompt) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/prompts/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: prompt.systemPrompt,
          userPromptTemplate: prompt.userPromptTemplate,
          maxTokens: prompt.maxTokens,
          changeNote: `Step ${stepNumber} 프롬프트 수정`,
        }),
      });
      if (andRerun) {
        onOpenChange(false);
        onRerun();
      } else {
        onOpenChange(false);
      }
    } catch { /* ignore */ }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Step {stepNumber} 프롬프트 수정</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : prompt ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">시스템 프롬프트</Label>
              <textarea
                value={prompt.systemPrompt}
                onChange={(e) => setPrompt({ ...prompt, systemPrompt: e.target.value })}
                className="w-full h-48 p-3 text-sm font-mono bg-muted/50 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                spellCheck={false}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">사용자 프롬프트 템플릿</Label>
              <textarea
                value={prompt.userPromptTemplate}
                onChange={(e) => setPrompt({ ...prompt, userPromptTemplate: e.target.value })}
                className="w-full h-36 p-3 text-sm font-mono bg-muted/50 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                spellCheck={false}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Max Tokens</Label>
              <Input
                type="number"
                value={prompt.maxTokens}
                onChange={(e) => setPrompt({ ...prompt, maxTokens: parseInt(e.target.value) || 4096 })}
                className="w-32"
              />
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            프롬프트를 불러올 수 없습니다
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            취소
          </Button>
          <Button onClick={() => handleSave(false)} disabled={saving || !prompt} className="gap-1.5">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            저장
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving || !prompt} className="gap-1.5">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            저장 후 재실행
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
