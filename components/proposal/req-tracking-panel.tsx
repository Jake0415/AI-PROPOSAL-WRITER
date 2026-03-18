'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  REQUIREMENT_CATEGORY_LABELS,
  type RequirementCategory,
  type StructuredRequirement,
  type TraceabilityMapping,
} from '@/lib/ai/types';
import { cn } from '@/lib/utils';

interface SectionWithReqs {
  sectionPath: string;
  title: string;
  linkedReqIds: string[];
}

interface ReqTrackingPanelProps {
  requirements: StructuredRequirement[];
  traceabilityMatrix: TraceabilityMapping[];
  sections: SectionWithReqs[];
}

interface CategoryStats {
  category: RequirementCategory;
  label: string;
  total: number;
  covered: number;
  mandatory: number;
  mandatoryCovered: number;
}

export function ReqTrackingPanel({
  requirements,
  traceabilityMatrix,
  sections,
}: ReqTrackingPanelProps) {
  // 섹션에서 커버하는 모든 REQ-ID 수집
  const coveredReqIds = useMemo(() => {
    const ids = new Set<string>();
    for (const section of sections) {
      if (section.linkedReqIds) {
        for (const id of section.linkedReqIds) {
          ids.add(id);
        }
      }
    }
    // 추적성 매트릭스에서도 매핑된 요구사항 추가
    for (const mapping of traceabilityMatrix) {
      ids.add(mapping.requirementId);
    }
    return ids;
  }, [sections, traceabilityMatrix]);

  // 카테고리별 통계
  const categoryStats = useMemo(() => {
    const categories = Object.keys(REQUIREMENT_CATEGORY_LABELS) as RequirementCategory[];
    return categories.map((cat): CategoryStats => {
      const catReqs = requirements.filter((r) => r.category === cat);
      const covered = catReqs.filter((r) => coveredReqIds.has(r.id));
      const mandatory = catReqs.filter((r) => r.mandatory);
      const mandatoryCovered = mandatory.filter((r) => coveredReqIds.has(r.id));
      return {
        category: cat,
        label: REQUIREMENT_CATEGORY_LABELS[cat],
        total: catReqs.length,
        covered: covered.length,
        mandatory: mandatory.length,
        mandatoryCovered: mandatoryCovered.length,
      };
    }).filter((s) => s.total > 0);
  }, [requirements, coveredReqIds]);

  const totalReqs = requirements.length;
  const totalCovered = requirements.filter((r) => coveredReqIds.has(r.id)).length;
  const coveragePercent = totalReqs > 0 ? Math.round((totalCovered / totalReqs) * 100) : 0;

  const mandatoryReqs = requirements.filter((r) => r.mandatory);
  const mandatoryCovered = mandatoryReqs.filter((r) => coveredReqIds.has(r.id)).length;
  const mandatoryPercent = mandatoryReqs.length > 0
    ? Math.round((mandatoryCovered / mandatoryReqs.length) * 100)
    : 0;

  // 미커버 필수 요구사항
  const missingMandatory = mandatoryReqs.filter((r) => !coveredReqIds.has(r.id));

  return (
    <div className="space-y-4">
      {/* 전체 커버리지 요약 */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="py-3 text-center">
            <CardTitle className={cn('text-2xl', coveragePercent >= 80 ? 'text-green-600' : 'text-orange-600')}>
              {coveragePercent}%
            </CardTitle>
            <p className="text-xs text-muted-foreground">전체 커버리지 ({totalCovered}/{totalReqs})</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-3 text-center">
            <CardTitle className={cn('text-2xl', mandatoryPercent === 100 ? 'text-green-600' : 'text-red-600')}>
              {mandatoryPercent}%
            </CardTitle>
            <p className="text-xs text-muted-foreground">필수 커버리지 ({mandatoryCovered}/{mandatoryReqs.length})</p>
          </CardHeader>
        </Card>
      </div>

      {/* 카테고리별 상세 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">카테고리별 현황</h4>
        {categoryStats.map((stat) => (
          <div key={stat.category} className="flex items-center justify-between text-sm py-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs w-10 justify-center">{stat.category}</Badge>
              <span className="text-muted-foreground">{stat.label}</span>
            </div>
            <span className={cn(
              'font-mono text-xs',
              stat.covered === stat.total ? 'text-green-600' : 'text-orange-600',
            )}>
              {stat.covered}/{stat.total}
            </span>
          </div>
        ))}
      </div>

      {/* 미커버 필수 요구사항 경고 */}
      {missingMandatory.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-red-600">미반영 필수 요구사항</h4>
          {missingMandatory.map((req) => (
            <div key={req.id} className="text-xs border border-red-200 dark:border-red-800 rounded p-2 bg-red-50 dark:bg-red-950/20">
              <div className="flex items-center gap-1 mb-1">
                <Badge variant="destructive" className="text-[10px] px-1">{req.id}</Badge>
                <Badge variant="outline" className="text-[10px] px-1">{req.category}</Badge>
              </div>
              <p className="text-muted-foreground">{req.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
