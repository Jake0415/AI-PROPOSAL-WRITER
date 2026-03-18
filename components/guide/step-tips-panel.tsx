'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Lightbulb, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getStepTips } from '@/lib/guide/tips-data';
import type { TipImportance } from '@/lib/guide/types';

const IMPORTANCE_STYLES: Record<TipImportance, string> = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  medium:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const IMPORTANCE_LABELS: Record<TipImportance, string> = {
  high: '필수',
  medium: '권장',
  low: '참고',
};

function extractStepKey(pathname: string): string {
  // /projects/[id]/analysis → 'analysis'
  const segments = pathname.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? '';
}

export function StepTipsPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const stepKey = extractStepKey(pathname);
  const tips = getStepTips(stepKey);

  // 팁이 없는 경로에서는 렌더링하지 않음
  if (tips.length === 0) {
    return null;
  }

  if (!isOpen) {
    return (
      <div className="shrink-0 border-l border-border/40 p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="h-8 w-8"
          title="팁 패널 열기"
        >
          <Lightbulb className="h-4 w-4 text-amber-500" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-64 shrink-0 border-l border-border/40">
      <div className="flex items-center justify-between p-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold">작성 팁</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-6 w-6"
          title="팁 패널 닫기"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-3.5rem-3rem-3rem)]">
        <div className="p-3 space-y-3">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="rounded-lg border border-border/60 p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-semibold leading-tight">
                  {tip.title}
                </h4>
                <Badge
                  className={cn(
                    'shrink-0 text-[10px] px-1.5 py-0',
                    IMPORTANCE_STYLES[tip.importance],
                  )}
                >
                  {IMPORTANCE_LABELS[tip.importance]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tip.content}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
