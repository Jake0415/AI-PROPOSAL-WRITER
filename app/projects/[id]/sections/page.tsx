'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProgressTracker } from '@/components/project/progress-tracker';
import { CoachingButton } from '@/components/guide/coaching-button';
import { AiChatPanel } from '@/components/project/ai-chat-panel';
import { useSSE } from '@/lib/hooks/use-sse';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MermaidDiagram } from '@/components/ui/mermaid-diagram';
import {
  ArrowRight,
  FileText,
  Loader2,
  Pencil,
  RefreshCw,
  Save,
  Sparkles,
  X,
} from 'lucide-react';

interface SectionData {
  id: string;
  sectionPath: string;
  title: string;
  content: string;
  diagrams: string;
  status: string;
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  pending: { label: '대기', variant: 'secondary' },
  generating: { label: '생성 중', variant: 'outline' },
  generated: { label: '생성 완료', variant: 'default' },
  edited: { label: '편집됨', variant: 'default' },
};

export default function SectionsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [sections, setSections] = useState<SectionData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const sse = useSSE<SectionData[]>();
  const loaded = useRef(false);

  const fetchExisting = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/sections`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setSections(data.data);
        }
      }
    } catch {
      // 섹션 없음
    }
  }, [projectId]);

  // 기존 섹션 로드
  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      fetchExisting();
    }
  }, [fetchExisting]);

  useEffect(() => {
    if (sse.result) {
      setSections(sse.result);
    }
  }, [sse.result]);

  function startGeneration() {
    sse.execute(`/api/projects/${projectId}/sections/generate`);
  }

  async function regenerateSection(sectionId: string) {
    setRegeneratingId(sectionId);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/sections/${sectionId}/regenerate`,
        { method: 'POST' },
      );
      const data = await res.json();
      if (data.success) {
        setSections((prev) =>
          prev.map((s) =>
            s.id === sectionId
              ? { ...s, content: data.data.content, diagrams: JSON.stringify(data.data.diagrams), status: 'generated' }
              : s,
          ),
        );
      }
    } catch {
      // 재생성 실패
    } finally {
      setRegeneratingId(null);
    }
  }

  function startEdit(section: SectionData) {
    setEditingId(section.id);
    setEditContent(section.content);
  }

  async function saveEdit(sectionId: string) {
    try {
      await fetch(`/api/projects/${projectId}/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? { ...s, content: editContent, status: 'edited' } : s,
        ),
      );
    } catch {
      // 저장 실패
    } finally {
      setEditingId(null);
      setEditContent('');
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditContent('');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">내용 생성</h2>
          <p className="text-muted-foreground mt-1">
            목차별 AI 내용을 생성하고 편집합니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sections.length === 0 && !sse.isLoading && (
            <Button onClick={startGeneration}>
              <Sparkles className="mr-2 h-4 w-4" />
              전체 생성
            </Button>
          )}
          {sections.length > 0 && (
            <>
              <AiChatPanel projectId={projectId} />
              <CoachingButton projectId={projectId} stepKey="outline" />
              <Button
                onClick={() => router.push(`/projects/${projectId}/output`)}
              >
                다음: 산출물 출력
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 진행률 */}
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

      {/* 빈 상태 */}
      {sections.length === 0 && !sse.isLoading && !sse.error && (
        <Card className="border-dashed">
          <CardHeader className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>섹션 내용 생성</CardTitle>
            <CardDescription>
              &quot;전체 생성&quot; 버튼을 클릭하면 목차별 상세 내용을 AI가
              자동으로 작성합니다.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* 섹션 목록 */}
      {sections.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              총 {sections.length}개 섹션
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={startGeneration}
              disabled={sse.isLoading}
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              전체 재생성
            </Button>
          </div>

          <Accordion type="multiple" className="space-y-2">
            {sections.map((section) => {
              const statusInfo = STATUS_LABELS[section.status] ?? STATUS_LABELS.pending;
              const isEditing = editingId === section.id;
              const isRegenerating = regeneratingId === section.id;

              return (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-xs text-muted-foreground font-mono w-8">
                        {section.sectionPath}
                      </span>
                      <span className="text-sm font-medium">
                        {section.title}
                      </span>
                      <Badge variant={statusInfo.variant} className="text-[10px]">
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {/* 액션 버튼 */}
                      <div className="flex items-center gap-2">
                        {!isEditing && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(section)}
                              disabled={isRegenerating}
                            >
                              <Pencil className="mr-1 h-3 w-3" />
                              편집
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => regenerateSection(section.id)}
                              disabled={isRegenerating}
                            >
                              {isRegenerating ? (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              ) : (
                                <RefreshCw className="mr-1 h-3 w-3" />
                              )}
                              재생성
                            </Button>
                          </>
                        )}
                        {isEditing && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => saveEdit(section.id)}
                            >
                              <Save className="mr-1 h-3 w-3" />
                              저장
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEdit}
                            >
                              <X className="mr-1 h-3 w-3" />
                              취소
                            </Button>
                          </>
                        )}
                      </div>

                      <Separator />

                      {/* 콘텐츠 */}
                      {isEditing ? (
                        <textarea
                          className="w-full min-h-[300px] rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono resize-y"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                        />
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                          {section.content || '(내용 없음)'}
                        </div>
                      )}

                      {/* Mermaid 다이어그램 */}
                      {!isEditing && section.diagrams && (() => {
                        try {
                          const diagrams: string[] = JSON.parse(section.diagrams);
                          if (diagrams.length === 0) return null;
                          return (
                            <div className="space-y-3 pt-2">
                              <p className="text-xs font-medium text-muted-foreground">다이어그램</p>
                              {diagrams.map((chart, idx) => (
                                <MermaidDiagram key={idx} chart={chart} />
                              ))}
                            </div>
                          );
                        } catch {
                          return null;
                        }
                      })()}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}
    </div>
  );
}
