'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { LayoutTemplate, List } from 'lucide-react';
import { OUTLINE_TEMPLATES, type OutlineTemplate } from '@/lib/data/outline-templates';
import type { OutlineSection } from '@/lib/ai/types';

interface OutlineTemplateSelectorProps {
  onApply: (sections: OutlineSection[]) => void;
}

const CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'si', label: 'SI' },
  { key: 'consulting', label: '컨설팅' },
  { key: 'maintenance', label: '유지보수' },
] as const;

function countAll(sections: OutlineSection[]): number {
  return sections.reduce((c, s) => c + 1 + (s.children?.length ? countAll(s.children) : 0), 0);
}

export function OutlineTemplateSelector({ onApply }: OutlineTemplateSelectorProps) {
  const [category, setCategory] = useState<string>('all');
  const [selected, setSelected] = useState<OutlineTemplate | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = category === 'all'
    ? OUTLINE_TEMPLATES
    : OUTLINE_TEMPLATES.filter((t) => t.category === category);

  function handleApply() {
    if (!selected) return;
    onApply(structuredClone(selected.sections));
    setOpen(false);
    setSelected(null);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LayoutTemplate className="mr-1 h-3 w-3" />
          템플릿
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>목차 템플릿 선택</DialogTitle>
        </DialogHeader>

        {/* 카테고리 탭 */}
        <div className="flex gap-1 border-b pb-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.key}
              variant={category === cat.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => { setCategory(cat.key); setSelected(null); }}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* 템플릿 목록 */}
        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
          {filtered.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => setSelected(tpl)}
              className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                selected?.id === tpl.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{tpl.name}</span>
                  <Badge variant="outline" className="text-[10px]">{tpl.categoryLabel}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {countAll(tpl.sections)}개 섹션
                </span>
              </div>
              <div className="space-y-0.5">
                {tpl.sections.map((s) => (
                  <div key={s.id} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <List className="h-3 w-3 shrink-0" />
                    <span>{s.title}</span>
                    {s.children?.length > 0 && (
                      <span className="text-muted-foreground/50">
                        ({s.children.length}개 하위)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button onClick={handleApply} disabled={!selected}>
            적용
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
