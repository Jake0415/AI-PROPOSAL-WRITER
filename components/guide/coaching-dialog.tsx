'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CoachingResult, CoachingRating } from '@/lib/guide/types';

interface CoachingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: CoachingResult | null;
  isLoading: boolean;
  progress: number;
  step: string;
  error: string | null;
}

const RATING_STYLES: Record<CoachingRating, string> = {
  good: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'needs-improvement':
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  critical:
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const RATING_LABELS: Record<CoachingRating, string> = {
  good: '양호',
  'needs-improvement': '개선 필요',
  critical: '주의',
};

function ScoreDisplay({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'text-green-600 dark:text-green-400'
      : score >= 60
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-600 dark:text-red-400';

  return (
    <div className="flex items-center gap-3">
      <div className={`text-4xl font-bold ${color}`}>{score}</div>
      <div className="text-sm text-muted-foreground">/ 100점</div>
    </div>
  );
}

export function CoachingDialog({
  open,
  onOpenChange,
  result,
  isLoading,
  progress,
  step,
  error,
}: CoachingDialogProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[480px]">
        <SheetHeader>
          <SheetTitle>AI 코칭 결과</SheetTitle>
          <SheetDescription>
            현재 단계 결과물에 대한 AI의 개선 피드백입니다.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          {/* 로딩 상태 */}
          {isLoading && (
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{step}</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                AI가 결과물을 분석하고 있습니다...
              </p>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="p-4">
              <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4">
                <p className="text-sm text-red-800 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* 결과 표시 */}
          {result && !isLoading && (
            <div className="space-y-6 p-4">
              {/* 점수 */}
              <div className="rounded-lg border p-4 space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  종합 점수
                </span>
                <ScoreDisplay score={result.overallScore} />
              </div>

              {/* 요약 */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  종합 평가
                </span>
                <p className="text-sm leading-relaxed">{result.summary}</p>
              </div>

              <Separator />

              {/* 피드백 목록 */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  상세 피드백
                </span>
                {result.feedback.map((fb, i) => (
                  <div
                    key={i}
                    className="rounded-lg border p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">{fb.area}</h4>
                      <Badge
                        className={RATING_STYLES[fb.rating]}
                      >
                        {RATING_LABELS[fb.rating]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {fb.comment}
                    </p>
                    <div className="rounded bg-muted/50 p-2">
                      <span className="text-[10px] font-semibold text-foreground">
                        개선 제안
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fb.suggestion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
