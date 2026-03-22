'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProgressTracker } from '@/components/project/progress-tracker';
import { CoachingButton } from '@/components/guide/coaching-button';
import { AiChatPanel } from '@/components/project/ai-chat-panel';
import { SectionContentViewer } from '@/components/project/section-content-viewer';
import { DataLoadingSpinner } from '@/components/project/data-loading-spinner';
import { useSSE } from '@/lib/hooks/use-sse';
import type { OutlineSection } from '@/lib/ai/types';
import type { GeneratedSection } from '@/lib/services/section-generator.service';
import { ArrowRight, ChevronDown, ChevronUp, Loader2, RotateCcw, Sparkles, Zap } from 'lucide-react';

interface SectionData {
  id: string;
  sectionPath: string;
  title: string;
  content: string;
  diagrams: unknown[];
  status: string;
}

interface Chapter {
  order: number;
  title: string;
  path: string;
}

export default function SectionsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const sse = useSSE<GeneratedSection[]>();
  const initialized = useRef(false);

  // 데이터 로드
  const loadData = useCallback(async () => {
    try {
      const [outlineRes, sectionsRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/outline`),
        fetch(`/api/projects/${projectId}/sections`),
      ]);

      if (outlineRes.ok) {
        const outlineJson = await outlineRes.json();
        if (outlineJson.success && outlineJson.data?.sections) {
          const outlineSections: OutlineSection[] = typeof outlineJson.data.sections === 'string'
            ? JSON.parse(outlineJson.data.sections)
            : outlineJson.data.sections;

          // level 1 섹션을 챕터로 추출
          const chapterList = outlineSections.map(s => ({
            order: s.order,
            title: s.title,
            path: `${s.order}`,
          }));
          setChapters(chapterList);
        }
      }

      if (sectionsRes.ok) {
        const sectionsJson = await sectionsRes.json();
        if (sectionsJson.success) {
          setSections(sectionsJson.data ?? []);
        }
      }
    } catch { /* ignore */ }
    setIsLoadingExisting(false);
  }, [projectId]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      loadData();
    }
  }, [loadData]);

  useEffect(() => {
    if (sse.result) {
      loadData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sse.result]);

  // 현재 탭의 섹션 필터링
  const filteredSections = activeTab === 'all'
    ? sections
    : sections.filter(s => s.sectionPath.startsWith(activeTab + '.') || s.sectionPath === activeTab);

  // 챕터별 통계
  function getChapterStats(chapterPath: string) {
    const chapterSections = sections.filter(s => s.sectionPath.startsWith(chapterPath + '.') || s.sectionPath === chapterPath);
    const completed = chapterSections.filter(s => s.status === 'generated' || s.status === 'edited').length;
    return { completed, total: chapterSections.length };
  }

  // 챕터 생성
  async function generateChapter(chapterPath: string) {
    await sse.execute(`/api/projects/${projectId}/sections/generate-chapter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapterPath, skipExisting: true }),
    });
  }

  // 개별 재생성
  async function regenerateSection(sectionId: string) {
    setRegeneratingId(sectionId);
    try {
      const res = await fetch(`/api/projects/${projectId}/sections/${sectionId}/regenerate`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSections(prev => prev.map(s => s.id === sectionId ? { ...s, ...data.data, status: 'generated' } : s));
        }
      }
    } catch { /* ignore */ }
    setRegeneratingId(null);
  }

  // 섹션 내용 저장
  async function saveSection(sectionId: string, content: string) {
    try {
      await fetch(`/api/projects/${projectId}/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      setSections(prev => prev.map(s => s.id === sectionId ? { ...s, content, status: 'edited' } : s));
    } catch { /* ignore */ }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'generated': return <Badge variant="default" className="text-[10px] bg-green-600">생성완료</Badge>;
      case 'edited': return <Badge variant="default" className="text-[10px] bg-blue-600">편집됨</Badge>;
      case 'generating': return <Badge variant="secondary" className="text-[10px]"><Loader2 className="h-3 w-3 animate-spin mr-1" />생성 중</Badge>;
      default: return <Badge variant="outline" className="text-[10px]">대기</Badge>;
    }
  };

  if (isLoadingExisting) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">내용 생성</h2>
        <DataLoadingSpinner message="섹션 데이터를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">내용 생성</h2>
          <p className="text-muted-foreground mt-1">목차별 AI 내용을 생성하고 편집합니다</p>
        </div>
        <div className="flex items-center gap-2">
          <AiChatPanel projectId={projectId} />
          <CoachingButton projectId={projectId} stepKey="sections" />
          {sections.length > 0 && (
            <Button onClick={() => router.push(`/projects/${projectId}/review`)}>
              다음: 검증 리포트
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => sse.execute(`/api/projects/${projectId}/sections/generate`)}
            disabled={sse.isLoading}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            전체 생성
          </Button>
        </div>
      </div>

      {/* SSE 진행률 */}
      <ProgressTracker progress={sse.progress} step={sse.step} isLoading={sse.isLoading} />

      {sse.error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive text-sm">{sse.error}</CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* 섹션이 없고 생성 중이 아닐 때 */}
      {sections.length === 0 && !sse.isLoading && chapters.length > 0 && (
        <Card>
          <CardHeader className="text-center py-16">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>섹션 내용 생성</CardTitle>
            <p className="text-muted-foreground mt-2">
              &ldquo;전체 생성&rdquo; 또는 챕터별로 AI가 내용을 작성합니다
            </p>
          </CardHeader>
        </Card>
      )}

      {/* 대분류 탭 */}
      {(sections.length > 0 || chapters.length > 0) && !sse.isLoading && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="all" className="text-xs">
              전체 ({sections.length})
            </TabsTrigger>
            {chapters.map(ch => {
              const stats = getChapterStats(ch.path);
              return (
                <TabsTrigger key={ch.path} value={ch.path} className="text-xs gap-1">
                  {ch.title.replace(/^\d+\.\s*/, '')}
                  {stats.total > 0 && (
                    <Badge variant="secondary" className="text-[9px] ml-1">
                      {stats.completed}/{stats.total}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* 챕터 헤더 + 생성 버튼 */}
          {activeTab !== 'all' && (
            <div className="flex items-center justify-between mt-4 mb-2">
              <div className="text-sm font-medium">
                {chapters.find(c => c.path === activeTab)?.title}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => generateChapter(activeTab)}
                disabled={sse.isLoading}
              >
                <Zap className="h-3.5 w-3.5" />
                챕터 생성
              </Button>
            </div>
          )}

          {/* 섹션 카드 리스트 */}
          <div className="space-y-2 mt-3">
            {filteredSections.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">
                이 챕터에 생성된 섹션이 없습니다. &ldquo;챕터 생성&rdquo;을 클릭하세요.
              </p>
            )}

            {filteredSections.map(section => {
              const isExpanded = expandedId === section.id;
              const isRegenerating = regeneratingId === section.id;

              return (
                <Card key={section.id}>
                  <CardHeader className="py-3 px-4">
                    {/* 섹션 헤더 */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{section.title}</span>
                      </div>

                      {statusBadge(section.status)}

                      <div className="flex items-center gap-1 shrink-0">
                        {(section.status === 'generated' || section.status === 'edited') && (
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => regenerateSection(section.id)}
                            disabled={isRegenerating}
                            title="재생성"
                          >
                            {isRegenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                          </Button>
                        )}
                        {section.content && (
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => setExpandedId(isExpanded ? null : section.id)}
                          >
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 확장: 3탭 콘텐츠 뷰어 */}
                    {isExpanded && section.content && (
                      <div className="mt-3">
                        <SectionContentViewer
                          content={section.content}
                          diagrams={section.diagrams}
                          onSave={(newContent) => saveSection(section.id, newContent)}
                        />
                      </div>
                    )}
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </Tabs>
      )}
    </div>
  );
}
