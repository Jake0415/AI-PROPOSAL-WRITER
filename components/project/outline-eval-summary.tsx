'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import type { OutlineSection, EvaluationCriterion } from '@/lib/ai/types';

interface OutlineEvalSummaryProps {
  sections: OutlineSection[];
  criteria: EvaluationCriterion[];
}

export function OutlineEvalSummary({ sections, criteria }: OutlineEvalSummaryProps) {
  if (!criteria.length || !sections.length) return null;

  const mappedEvalIds = new Set(
    sections.filter((s) => s.level === 0 && s.evalItemId).map((s) => s.evalItemId),
  );

  const unmapped = criteria.filter(
    (c) => !mappedEvalIds.has(`${c.category}-${c.item}`),
  );

  const coveragePct = criteria.length > 0
    ? Math.round((mappedEvalIds.size / criteria.length) * 100)
    : 0;

  const isComplete = unmapped.length === 0;

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30 flex-wrap">
      {isComplete ? (
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
      )}

      <span className="text-sm">
        매핑 완료: {mappedEvalIds.size}/{criteria.length} 평가항목 ({coveragePct}%)
      </span>

      {unmapped.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs text-muted-foreground">미매핑:</span>
          {unmapped.map((c, i) => (
            <Badge key={i} variant="secondary" className="text-[10px]">
              [{c.category}] {c.item} ({c.score}점)
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
