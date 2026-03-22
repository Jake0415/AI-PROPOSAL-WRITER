'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressTracker } from '@/components/project/progress-tracker';
import { CoachingButton } from '@/components/guide/coaching-button';
import { AiChatPanel } from '@/components/project/ai-chat-panel';
import { SectionContentViewer } from '@/components/project/section-content-viewer';
import { DataLoadingSpinner } from '@/components/project/data-loading-spinner';
import { useSSE } from '@/lib/hooks/use-sse';
import type { OutlineSection } from '@/lib/ai/types';
import type { GeneratedSection } from '@/lib/services/section-generator.service';
import { ArrowRight, ChevronDown, ChevronUp, Loader2, RotateCcw, Sparkles, Zap, ImagePlus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface SectionData {
  id: string;
  sectionPath: string;
  title: string;
  content: string;
  diagrams: unknown[];
  status: string;
}

export default function SectionsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [outlineSections, setOutlineSections] = useState<OutlineSection[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const [generatingPath, setGeneratingPath] = useState<string | null>(null);
  const sse = useSSE<GeneratedSection[]>();
  const initialized = useRef(false);

  const loadData = useCallback(async () => {
    try {
      const [outlineRes, sectionsRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/outline`),
        fetch(`/api/projects/${projectId}/sections`),
      ]);

      if (outlineRes.ok) {
        const json = await outlineRes.json();
        if (json.success && json.data?.sections) {
          const parsed = typeof json.data.sections === 'string'
            ? JSON.parse(json.data.sections)
            : json.data.sections;
          setOutlineSections(parsed);
          if (!activeTab && parsed.length > 0) {
            setActiveTab(`${parsed[0].order}`);
          }
        }
      }

      if (sectionsRes.ok) {
        const json = await sectionsRes.json();
        if (json.success) setSections(json.data ?? []);
      }
    } catch { /* ignore */ }
    setIsLoadingExisting(false);
  }, [projectId, activeTab]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      loadData();
    }
  }, [loadData]);

  useEffect(() => {
    if (sse.result) loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sse.result]);

  // 현재 탭의 챕터
  const currentChapter = outlineSections.find(s => `${s.order}` === activeTab);
  const subChapters = currentChapter?.children ?? [];

  // 서브 챕터별 생성 상태
  function getSubChapterStatus(scPath: string) {
    const section = sections.find(s => s.sectionPath === scPath);
    return section?.status ?? 'pending';
  }

  function getSubChapterSection(scPath: string) {
    return sections.find(s => s.sectionPath === scPath);
  }

  // 챕터별 통계
  function getChapterStats(chapterOrder: number) {
    const chapter = outlineSections.find(s => s.order === chapterOrder);
    const total = chapter?.children?.length ?? 0;
    const completed = (chapter?.children ?? []).filter(sc => {
      const status = getSubChapterStatus(`${chapterOrder}.${sc.order}`);
      return status === 'generated' || status === 'edited';
    }).length;
    return { completed, total };
  }

  // 챕터 생성
  async function generateChapter(chapterPath: string) {
    await sse.execute(`/api/projects/${projectId}/sections/generate-chapter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapterPath, skipExisting: true }),
    });
  }

  // 개별 서브 챕터 재생성
  async function regenerateSubChapter(scPath: string) {
    setGeneratingPath(scPath);
    try {
      const res = await fetch(`/api/projects/${projectId}/sections/regenerate-sub`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subChapterPath: scPath }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSections(prev => {
            const exists = prev.find(s => s.sectionPath === scPath);
            if (exists) return prev.map(s => s.sectionPath === scPath ? { ...s, ...data.data } : s);
            return [...prev, data.data];
          });
        }
      }
    } catch { /* ignore */ }
    setGeneratingPath(null);
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

  // 이미지 마커 파싱 + 버튼 렌더링
  function renderContentWithImageMarkers(content: string, sectionId: string) {
    const parts = content.split(/(<!-- IMAGE: \{.*?\} -->)/g);

    return parts.map((part, i) => {
      const markerMatch = part.match(/<!-- IMAGE: (\{.*?\}) -->/);
      if (markerMatch) {
        try {
          const meta = JSON.parse(markerMatch[1]);
          return (
            <div key={i} className="my-3 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{meta.title ?? '시각 자료'}</p>
                <p className="text-xs text-muted-foreground">{meta.description ?? ''}</p>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => generateDiagram(sectionId, meta)}>
                <ImagePlus className="h-3.5 w-3.5" />
                이미지 생성
              </Button>
            </div>
          );
        } catch { return null; }
      }
      return <ReactMarkdown key={i}>{part}</ReactMarkdown>;
    });
  }

  // Mermaid 다이어그램 생성 (placeholder)
  async function generateDiagram(sectionId: string, meta: { type: string; title: string; description: string }) {
    // TODO: LLM에 Mermaid 코드 생성 요청 → content에 삽입
    alert(`"${meta.title}" 다이어그램 생성 기능은 준비 중입니다.`);
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'generated': return <Badge variant="default" className="text-[10px] bg-green-600">생성완료</Badge>;
      case 'edited': return <Badge variant="default" className="text-[10px] bg-blue-600">편집됨</Badge>;
      default: return <Badge variant="outline" className="text-[10px]">대기</Badge>;
    }
  };

  if (isLoadingExisting) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">내용 생성</h2>
        <DataLoadingSpinner message="섹션 데이터를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">내용 생성</h2>
          <p className="text-muted-foreground mt-1">서브 챕터 단위로 AI 내용을 생성하고 편집합니다</p>
        </div>
        <div className="flex items-center gap-2">
          <AiChatPanel projectId={projectId} />
          <CoachingButton projectId={projectId} stepKey="sections" />
          {sections.length > 0 && (
            <Button onClick={() => router.push(`/projects/${projectId}/review`)}>
              다음: 검증 리포트 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" onClick={() => sse.execute(`/api/projects/${projectId}/sections/generate`)} disabled={sse.isLoading} className="gap-2">
            <Sparkles className="h-4 w-4" /> 전체 생성
          </Button>
        </div>
      </div>

      <ProgressTracker progress={sse.progress} step={sse.step} isLoading={sse.isLoading} />

      {/* 대분류 탭 (outline level 1에서 동적 생성) */}
      {outlineSections.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            {outlineSections.map(chapter => {
              const stats = getChapterStats(chapter.order);
              return (
                <TabsTrigger key={chapter.order} value={`${chapter.order}`} className="text-xs gap-1">
                  {chapter.title.replace(/^\d+\.\s*/, '')}
                  {stats.total > 0 && (
                    <Badge variant="secondary" className="text-[9px] ml-1">{stats.completed}/{stats.total}</Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      )}

      {/* 챕터 헤더 */}
      {currentChapter && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{currentChapter.title}</h3>
          <Button size="sm" variant="outline" className="gap-1.5"
            onClick={() => generateChapter(activeTab)} disabled={sse.isLoading}>
            <Zap className="h-3.5 w-3.5" /> 챕터 생성
          </Button>
        </div>
      )}

      {/* 서브 챕터 카드 (level 2) */}
      <div className="space-y-3">
        {subChapters.map(sc => {
          const scPath = `${activeTab}.${sc.order}`;
          const status = getSubChapterStatus(scPath);
          const section = getSubChapterSection(scPath);
          const isExpanded = expandedPath === scPath;
          const isGenerating = generatingPath === scPath;

          return (
            <Card key={scPath}>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium">{sc.title}</CardTitle>
                    {/* 하위 섹션 목록 */}
                    {(sc.children ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(sc.children ?? []).map((child, i) => (
                          <Badge key={i} variant="outline" className="text-[9px]">{child.title.replace(/^\d+[\.\d]*\s*/, '')}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {statusBadge(status)}

                  <div className="flex items-center gap-1 shrink-0">
                    {status === 'pending' && (
                      <Button variant="outline" size="sm" className="gap-1 h-7" onClick={() => regenerateSubChapter(scPath)} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                        생성
                      </Button>
                    )}
                    {(status === 'generated' || status === 'edited') && (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => regenerateSubChapter(scPath)} disabled={isGenerating} title="재생성">
                          {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpandedPath(isExpanded ? null : scPath)}>
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* 확장: 콘텐츠 뷰어 (Pretty Print에서 이미지 마커 버튼 포함) */}
                {isExpanded && section && (
                  <div className="mt-3">
                    <SectionContentViewer
                      content={section.content}
                      diagrams={section.diagrams}
                      onSave={(newContent) => saveSection(section.id, newContent)}
                      renderPrettyPrint={(content) => (
                        <div className="prose prose-sm dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          {renderContentWithImageMarkers(content, section.id)}
                        </div>
                      )}
                    />
                  </div>
                )}
              </CardHeader>
            </Card>
          );
        })}

        {subChapters.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">이 챕터에 서브 챕터가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
