'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressTracker } from '@/components/project/progress-tracker';
import { useSSE } from '@/lib/hooks/use-sse';
import type { OutlineSection } from '@/lib/ai/types';
import { ArrowRight, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OutlinePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [sections, setSections] = useState<OutlineSection[]>([]);
  const sse = useSSE<OutlineSection[]>();

  useEffect(() => {
    if (!sse.result) {
      sse.execute(`/api/projects/${projectId}/outline/generate`);
    }
  }, [projectId]);

  useEffect(() => {
    if (sse.result) {
      setSections(sse.result);
    }
  }, [sse.result]);

  function renderSections(items: OutlineSection[], depth = 0) {
    return items.map((section) => (
      <div key={section.id}>
        <div
          className={cn(
            'flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted/50 text-sm',
            depth === 0 && 'font-medium text-base',
          )}
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          <List className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          {section.title}
        </div>
        {section.children?.length > 0 && renderSections(section.children, depth + 1)}
      </div>
    ));
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">목차 구성</h2>
          <p className="text-muted-foreground mt-1">
            공공 제안서 작성법 기반으로 목차를 자동 구성합니다
          </p>
        </div>
        {sections.length > 0 && (
          <Button onClick={() => router.push(`/projects/${projectId}/sections`)}>
            다음: 내용 생성
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <ProgressTracker
        progress={sse.progress}
        step={sse.step}
        isLoading={sse.isLoading}
      />

      {sse.error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">오류</CardTitle>
            <CardDescription>{sse.error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {sections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">제안서 목차</CardTitle>
            <CardDescription>
              총 {countSections(sections)}개 섹션이 구성되었습니다
            </CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">{renderSections(sections)}</div>
        </Card>
      )}
    </div>
  );
}

function countSections(sections: OutlineSection[]): number {
  let count = sections.length;
  for (const s of sections) {
    if (s.children?.length) {
      count += countSections(s.children);
    }
  }
  return count;
}
