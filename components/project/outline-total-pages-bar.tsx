'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import { sumPages } from '@/lib/utils/outline-numbering';
import type { OutlineSection } from '@/lib/ai/types';

interface OutlineTotalPagesBarProps {
  totalPages: number;
  onTotalPagesChange: (pages: number) => void;
  sections: OutlineSection[];
  onAutoAllocate: () => void;
  disabled?: boolean;
}

export function OutlineTotalPagesBar({
  totalPages,
  onTotalPagesChange,
  sections,
  onAutoAllocate,
  disabled,
}: OutlineTotalPagesBarProps) {
  const currentSum = sumPages(sections);
  const diff = totalPages - currentSum;
  const hasSections = sections.length > 0;
  const hasScores = sections.some((s) => s.evalScore);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">총 페이지 수</span>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              value={totalPages}
              onChange={(e) => onTotalPagesChange(Math.max(10, Number(e.target.value) || 100))}
              className="w-20 h-8 text-sm text-center"
              min={10}
              max={500}
              disabled={disabled}
            />
            <span className="text-sm text-muted-foreground">p</span>
          </div>
          {!hasSections && (
            <span className="text-xs text-muted-foreground">
              일반적으로 100~150p가 권장됩니다
            </span>
          )}
        </div>

        {hasSections && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              현재 합계: <strong>{currentSum}p</strong>
            </span>

            {diff > 0 && (
              <Badge variant="secondary" className="text-xs">
                {diff}p 미배분
              </Badge>
            )}
            {diff === 0 && (
              <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                배분 완료
              </Badge>
            )}
            {diff < 0 && (
              <Badge variant="destructive" className="text-xs">
                {Math.abs(diff)}p 초과
              </Badge>
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={onAutoAllocate}
              disabled={disabled || !hasScores}
              title={!hasScores ? '대분류에 평가항목을 먼저 매핑하세요' : ''}
            >
              <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
              배점 기반 자동 배분
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
