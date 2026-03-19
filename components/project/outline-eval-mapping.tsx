'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calculator, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { EvaluationCriterion, OutlineSection } from '@/lib/ai/types';

interface OutlineEvalMappingProps {
  criteria: EvaluationCriterion[];
  sections: OutlineSection[];
  onSectionsChange: (sections: OutlineSection[]) => void;
}

export function OutlineEvalMapping({
  criteria,
  sections,
  onSectionsChange,
}: OutlineEvalMappingProps) {
  const [totalPages, setTotalPages] = useState(100);

  if (!criteria.length) return null;

  // 대분류(level=0) 섹션만 매핑 대상
  const topSections = sections.filter((s) => s.level === 0);

  // 매핑 상태 계산
  const mappedEvalIds = new Set(
    topSections.map((s) => s.evalItemId).filter(Boolean),
  );
  const unmappedCriteria = criteria.filter(
    (c) => !mappedEvalIds.has(`${c.category}-${c.item}`),
  );
  const coveragePercent = criteria.length > 0
    ? Math.round((mappedEvalIds.size / criteria.length) * 100)
    : 0;

  // 평가항목 매핑 변경
  function handleMapChange(sectionId: string, evalKey: string) {
    const criterion = criteria.find((c) => `${c.category}-${c.item}` === evalKey);
    const updated = sections.map((s) => {
      if (s.id === sectionId) {
        return {
          ...s,
          evalItemId: evalKey || undefined,
          evalScore: criterion?.score ?? undefined,
        };
      }
      return s;
    });
    onSectionsChange(updated);
  }

  // 배점 비례 페이지 자동 배분
  function handleAutoAllocate() {
    const totalScore = topSections.reduce((sum, s) => sum + (s.evalScore ?? 0), 0);
    if (totalScore === 0) return;

    const updated = sections.map((s) => {
      if (s.level === 0 && s.evalScore) {
        const pages = Math.max(1, Math.round(totalPages * (s.evalScore / totalScore)));
        return { ...s, estimatedPages: pages };
      }
      return s;
    });
    onSectionsChange(updated);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">평가항목-목차 매핑</CardTitle>
        <CardDescription>
          각 대분류 목차에 평가항목을 매핑하고 페이지를 배분합니다
        </CardDescription>
      </CardHeader>
      <div className="px-6 pb-6 space-y-4">
        {/* 커버리지 요약 */}
        <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
          <div className="flex items-center gap-2 text-sm">
            {coveragePercent === 100 ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            )}
            <span>
              매핑 완료: {mappedEvalIds.size}/{criteria.length} 평가항목 ({coveragePercent}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={totalPages}
              onChange={(e) => setTotalPages(Number(e.target.value) || 100)}
              className="w-20 h-8 text-sm"
              min={10}
              max={500}
            />
            <span className="text-xs text-muted-foreground">페이지</span>
            <Button size="sm" variant="outline" onClick={handleAutoAllocate}>
              <Calculator className="mr-1 h-3 w-3" />
              자동 배분
            </Button>
          </div>
        </div>

        {/* 매핑 테이블 */}
        <div className="space-y-2">
          {topSections.map((section) => (
            <div
              key={section.id}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium truncate block">
                  {section.title}
                </span>
              </div>
              <select
                value={section.evalItemId ?? ''}
                onChange={(e) => handleMapChange(section.id, e.target.value)}
                className="h-8 rounded-md border bg-background px-2 text-xs max-w-[220px]"
              >
                <option value="">매핑 안 됨</option>
                {criteria.map((c) => {
                  const key = `${c.category}-${c.item}`;
                  return (
                    <option key={key} value={key}>
                      [{c.category}] {c.item} ({c.score}점)
                    </option>
                  );
                })}
              </select>
              {section.evalScore && (
                <Badge variant="outline" className="text-xs shrink-0">
                  {section.evalScore}점
                </Badge>
              )}
              {section.estimatedPages && (
                <Badge className="text-xs shrink-0">
                  {section.estimatedPages}p
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* 미매핑 경고 */}
        {unmappedCriteria.length > 0 && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 p-3">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
              미매핑 평가항목 ({unmappedCriteria.length}개)
            </p>
            <div className="flex flex-wrap gap-1">
              {unmappedCriteria.map((c, i) => (
                <Badge key={i} variant="secondary" className="text-[10px]">
                  [{c.category}] {c.item} ({c.score}점)
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
