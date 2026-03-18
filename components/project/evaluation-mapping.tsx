'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import type { EvaluationCriterion } from '@/lib/ai/types';
import type { OutlineSection } from '@/lib/ai/types';

interface EvaluationMappingProps {
  criteria: EvaluationCriterion[];
  outlineSections: OutlineSection[];
}

// 평가항목과 목차 섹션의 키워드 매칭
function findMatchingSections(
  criterion: EvaluationCriterion,
  sections: OutlineSection[],
  parentPath = '',
): string[] {
  const matches: string[] = [];
  const keywords = [
    criterion.category.toLowerCase(),
    criterion.item.toLowerCase(),
    ...criterion.description.toLowerCase().split(/[\s,]+/).filter((w) => w.length > 2),
  ];

  for (const section of sections) {
    const path = parentPath ? `${parentPath} > ${section.title}` : section.title;
    const titleLower = section.title.toLowerCase();

    const isMatch = keywords.some(
      (kw) => titleLower.includes(kw) || kw.includes(titleLower.slice(0, 4)),
    );

    if (isMatch) {
      matches.push(path);
    }

    if (section.children?.length) {
      matches.push(...findMatchingSections(criterion, section.children, path));
    }
  }

  return matches;
}

export function EvaluationMapping({
  criteria,
  outlineSections,
}: EvaluationMappingProps) {
  if (!criteria.length || !outlineSections.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">평가항목 - 목차 매핑</CardTitle>
      </CardHeader>
      <div className="px-6 pb-6">
        <div className="space-y-3">
          {criteria.map((criterion, i) => {
            const matchingSections = findMatchingSections(
              criterion,
              outlineSections,
            );

            return (
              <div key={i} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {criterion.score}점
                    </Badge>
                    <span className="text-sm font-medium">
                      {criterion.category} - {criterion.item}
                    </span>
                  </div>
                </div>
                {matchingSections.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {matchingSections.map((section, j) => (
                      <Badge
                        key={j}
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {section}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    대응하는 목차 섹션을 찾을 수 없습니다. 목차를 확인해주세요.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
