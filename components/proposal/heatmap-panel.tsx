'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  EvaluationItem,
  RecommendedChapter,
} from '@/lib/ai/types';
import { cn } from '@/lib/utils';

interface HeatmapPanelProps {
  evaluationItems: EvaluationItem[];
  recommendedChapters: RecommendedChapter[];
}

function scoreColor(score: number, maxScore: number): string {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  if (ratio >= 0.7) return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
  if (ratio >= 0.4) return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700';
  return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700';
}

export function HeatmapPanel({
  evaluationItems,
  recommendedChapters,
}: HeatmapPanelProps) {
  const maxScore = useMemo(() => {
    return Math.max(...evaluationItems.map((e) => e.score), 1);
  }, [evaluationItems]);

  const totalScore = useMemo(() => {
    return evaluationItems.reduce((sum, e) => sum + e.score, 0);
  }, [evaluationItems]);

  const totalPages = useMemo(() => {
    return recommendedChapters.reduce((sum, c) => sum + (c.recommendedPages ?? 0), 0);
  }, [recommendedChapters]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">배점 분포 히트맵</CardTitle>
          <p className="text-xs text-muted-foreground">
            배점 {totalScore}점 / 권장 {totalPages}페이지
          </p>
        </CardHeader>
      </Card>

      {/* 평가항목 히트맵 */}
      <div className="space-y-2">
        {evaluationItems.map((item) => {
          const chapter = recommendedChapters.find((c) => c.evalId === item.id);
          const pages = chapter?.recommendedPages ?? 0;

          return (
            <div
              key={item.id}
              className={cn(
                'rounded border p-2 text-xs transition-colors',
                scoreColor(item.score, maxScore),
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] px-1">{item.id}</Badge>
                  <span className="font-medium truncate max-w-[120px]">{item.item}</span>
                </div>
                <span className="font-mono font-bold">{item.score}점</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{item.category}</span>
                {pages > 0 && <span>{pages}p 권장</span>}
              </div>
              {/* 비율 바 */}
              <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/60 rounded-full transition-all"
                  style={{ width: `${(item.score / maxScore) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30 border border-red-300" />
          고배점
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300" />
          중배점
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30 border border-green-300" />
          저배점
        </div>
      </div>
    </div>
  );
}
