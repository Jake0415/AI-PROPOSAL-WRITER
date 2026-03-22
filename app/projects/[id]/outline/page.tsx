'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressTracker } from '@/components/project/progress-tracker';
import { useSSE } from '@/lib/hooks/use-sse';
import type { OutlineSection } from '@/lib/ai/types';
import { CoachingButton } from '@/components/guide/coaching-button';
import { AiChatPanel } from '@/components/project/ai-chat-panel';
import { OutlineEvalMapping } from '@/components/project/outline-eval-mapping';
import { OutlineTemplateSelector } from '@/components/project/outline-template-selector';
import { ArrowRight, GripVertical, List, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataLoadingSpinner } from '@/components/project/data-loading-spinner';
import type { EvaluationCriterion } from '@/lib/ai/types';

export default function OutlinePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [sections, setSections] = useState<OutlineSection[]>([]);
  const [criteria, setCriteria] = useState<EvaluationCriterion[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const sse = useSSE<OutlineSection[]>();
  const initialized = useRef(false);

  // 평가항목 로드
  useEffect(() => {
    fetch(`/api/projects/${projectId}/rfp/analysis`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.evaluationCriteria) {
          setCriteria(json.data.evaluationCriteria);
        }
      })
      .catch(() => {});
  }, [projectId]);

  // 기존 데이터 로드 후 없으면 생성
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetch(`/api/projects/${projectId}/outline`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data?.sections) {
            const parsed = typeof json.data.sections === 'string'
              ? JSON.parse(json.data.sections)
              : json.data.sections;
            if (parsed.length > 0) {
              setSections(parsed);
              return;
            }
          }
          sse.execute(`/api/projects/${projectId}/outline/generate`);
        })
        .catch(() => { /* 에러 시 자동 생성하지 않음 */ })
        .finally(() => setIsLoadingExisting(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (sse.result) setSections(sse.result);
  }, [sse.result]);

  // 드래그앤드롭으로 순서 변경 (같은 레벨)
  const handleDragStart = useCallback((id: string) => setDragId(id), []);

  const handleDrop = useCallback(
    (targetId: string) => {
      if (!dragId || dragId === targetId) {
        setDragId(null);
        return;
      }

      function reorder(items: OutlineSection[]): OutlineSection[] {
        const dragIdx = items.findIndex((s) => s.id === dragId);
        const dropIdx = items.findIndex((s) => s.id === targetId);

        if (dragIdx !== -1 && dropIdx !== -1) {
          const updated = [...items];
          const [moved] = updated.splice(dragIdx, 1);
          updated.splice(dropIdx, 0, moved);
          return updated.map((s, i) => ({ ...s, order: i + 1 }));
        }

        return items.map((s) => ({
          ...s,
          children: s.children?.length ? reorder(s.children) : s.children,
        }));
      }

      const updated = reorder(sections);
      setSections(updated);
      setDragId(null);

      // 서버에 저장
      fetch(`/api/projects/${projectId}/outline`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: updated }),
      }).catch(() => {});
    },
    [dragId, sections, projectId],
  );

  function renderSections(items: OutlineSection[], depth = 0) {
    return items.map((section) => (
      <div key={section.id}>
        <div
          draggable
          onDragStart={() => handleDragStart(section.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(section.id)}
          className={cn(
            'flex items-center gap-2 py-2 px-3 rounded-md text-sm transition-colors cursor-move group',
            depth === 0 && 'font-medium text-base',
            dragId === section.id
              ? 'opacity-50 bg-muted'
              : 'hover:bg-muted/50',
          )}
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
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
            드래그하여 순서를 변경할 수 있습니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sections.length > 0 && (
            <>
              <OutlineTemplateSelector
                onApply={(tplSections) => {
                  setSections(tplSections);
                  fetch(`/api/projects/${projectId}/outline`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sections: tplSections }),
                  }).catch(() => {});
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => sse.execute(`/api/projects/${projectId}/outline/generate`)}
                disabled={sse.isLoading}
              >
                <Sparkles className="mr-1 h-3 w-3" />
                재생성
              </Button>
              <AiChatPanel projectId={projectId} />
              <CoachingButton projectId={projectId} stepKey="outline" />
              <Button onClick={() => router.push(`/projects/${projectId}/sections`)}>
                다음: 내용 생성
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {isLoadingExisting && !sse.isLoading && (
        <DataLoadingSpinner message="목차 데이터를 불러오는 중..." />
      )}

      <ProgressTracker progress={sse.progress} step={sse.step} isLoading={sse.isLoading} />

      {sse.error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">오류</CardTitle>
            <CardDescription>{sse.error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {sections.length > 0 && criteria.length > 0 && (
        <OutlineEvalMapping
          criteria={criteria}
          sections={sections}
          onSectionsChange={(updated) => {
            setSections(updated);
            fetch(`/api/projects/${projectId}/outline`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sections: updated }),
            }).catch(() => {});
          }}
        />
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
