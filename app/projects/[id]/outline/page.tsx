'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSSE } from '@/lib/hooks/use-sse';
import type { OutlineSection, EvaluationCriterion } from '@/lib/ai/types';
import { CoachingButton } from '@/components/guide/coaching-button';
import { AiChatPanel } from '@/components/project/ai-chat-panel';
import { DataLoadingSpinner } from '@/components/project/data-loading-spinner';
import { OutlineTotalPagesBar } from '@/components/project/outline-total-pages-bar';
import { OutlineSourceTabs } from '@/components/project/outline-source-tabs';
import { OutlineTreeEditor } from '@/components/project/outline-tree-editor';
import { OutlineEvalSummary } from '@/components/project/outline-eval-summary';
import { autoAllocatePages } from '@/lib/utils/outline-helpers';
import { ArrowRight } from 'lucide-react';

export default function OutlinePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [sections, setSections] = useState<OutlineSection[]>([]);
  const [criteria, setCriteria] = useState<EvaluationCriterion[]>([]);
  const [totalPages, setTotalPages] = useState(100);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const [saving, setSaving] = useState(false);

  const sse = useSSE<OutlineSection[]>();
  const initialized = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // 기존 데이터 로드 (자동 생성 안 함)
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetch(`/api/projects/${projectId}/outline`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data?.sections) {
            const parsed =
              typeof json.data.sections === 'string'
                ? JSON.parse(json.data.sections)
                : json.data.sections;
            if (parsed.length > 0) {
              setSections(parsed);
            }
            if (json.data.totalPages) {
              setTotalPages(json.data.totalPages);
            }
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingExisting(false));
    }
  }, [projectId]);

  // SSE 결과 반영
  useEffect(() => {
    if (sse.result) setSections(sse.result);
  }, [sse.result]);

  // Debounced 자동 저장
  const saveToServer = useCallback(
    (newSections: OutlineSection[], newTotalPages?: number) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        setSaving(true);
        fetch(`/api/projects/${projectId}/outline`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sections: newSections,
            totalPages: newTotalPages ?? totalPages,
          }),
        })
          .catch(() => {})
          .finally(() => {
            setTimeout(() => setSaving(false), 800);
          });
      }, 1000);
    },
    [projectId, totalPages],
  );

  // sections 변경 핸들러
  const handleSectionsChange = useCallback(
    (newSections: OutlineSection[]) => {
      setSections(newSections);
      saveToServer(newSections);
    },
    [saveToServer],
  );

  // 총 페이지 변경
  const handleTotalPagesChange = useCallback(
    (pages: number) => {
      setTotalPages(pages);
      if (sections.length > 0) {
        saveToServer(sections, pages);
      }
    },
    [sections, saveToServer],
  );

  // 자동 배분
  const handleAutoAllocate = useCallback(() => {
    const allocated = autoAllocatePages(sections, totalPages);
    setSections(allocated);
    saveToServer(allocated);
  }, [sections, totalPages, saveToServer]);

  // AI 생성
  const handleGenerate = useCallback(() => {
    sse.execute(`/api/projects/${projectId}/outline/generate`);
  }, [sse, projectId]);

  // 템플릿 적용
  const handleApplyTemplate = useCallback(
    (tplSections: OutlineSection[]) => {
      setSections(tplSections);
      // 템플릿 적용 시 즉시 저장
      fetch(`/api/projects/${projectId}/outline`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: tplSections, totalPages }),
      }).catch(() => {});
    },
    [projectId, totalPages],
  );

  const hasSections = sections.length > 0;
  const description = hasSections
    ? '드래그하여 순서 변경, 더블클릭하여 제목 편집'
    : 'RFP 분석 결과를 바탕으로 제안서 목차를 구성합니다';

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">목차 구성</h2>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <AiChatPanel projectId={projectId} />
          <CoachingButton projectId={projectId} stepKey="outline" />
          {hasSections && (
            <Button onClick={() => router.push(`/projects/${projectId}/sections`)}>
              다음: 내용 생성
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoadingExisting && !sse.isLoading && (
        <DataLoadingSpinner message="목차 데이터를 불러오는 중..." />
      )}

      {/* Error */}
      {sse.error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">오류</CardTitle>
            <CardDescription>{sse.error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Total Pages Bar */}
      {!isLoadingExisting && (
        <OutlineTotalPagesBar
          totalPages={totalPages}
          onTotalPagesChange={handleTotalPagesChange}
          sections={sections}
          onAutoAllocate={handleAutoAllocate}
          disabled={sse.isLoading}
        />
      )}

      {/* Source Tabs (AI / Template) */}
      {!isLoadingExisting && (
        <OutlineSourceTabs
          hasSections={hasSections}
          isGenerating={sse.isLoading}
          sseProgress={sse.progress}
          sseStep={sse.step}
          onGenerate={handleGenerate}
          onApplyTemplate={handleApplyTemplate}
        />
      )}

      {/* Tree Editor */}
      {hasSections && (
        <OutlineTreeEditor
          sections={sections}
          criteria={criteria}
          onChange={handleSectionsChange}
          saving={saving}
        />
      )}

      {/* Eval Summary */}
      {hasSections && criteria.length > 0 && (
        <OutlineEvalSummary sections={sections} criteria={criteria} />
      )}

      {/* Next button (bottom) */}
      {hasSections && (
        <div className="flex justify-end pt-2">
          <Button onClick={() => router.push(`/projects/${projectId}/sections`)}>
            다음: 내용 생성
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
