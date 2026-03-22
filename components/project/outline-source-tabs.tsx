'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, LayoutTemplate, Check } from 'lucide-react';
import { ProgressTracker } from '@/components/project/progress-tracker';
import { OUTLINE_TEMPLATES, type OutlineTemplate } from '@/lib/data/outline-templates';
import type { OutlineSection } from '@/lib/ai/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface OutlineSourceTabsProps {
  hasSections: boolean;
  isGenerating: boolean;
  sseProgress: number;
  sseStep: string;
  onGenerate: () => void;
  onApplyTemplate: (sections: OutlineSection[]) => void;
}

export function OutlineSourceTabs({
  hasSections,
  isGenerating,
  sseProgress,
  sseStep,
  onGenerate,
  onApplyTemplate,
}: OutlineSourceTabsProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<OutlineTemplate | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const handleAction = (action: () => void) => {
    if (hasSections) {
      setPendingAction(() => action);
      setShowConfirm(true);
    } else {
      action();
    }
  };

  return (
    <>
      <Tabs defaultValue="ai">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="ai" className="flex-1">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            AI 자동 생성
          </TabsTrigger>
          <TabsTrigger value="template" className="flex-1">
            <LayoutTemplate className="h-3.5 w-3.5 mr-1.5" />
            템플릿 기반 생성
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-3">
          {isGenerating ? (
            <ProgressTracker
              progress={sseProgress}
              step={sseStep}
              isLoading={true}
            />
          ) : (
            <div className="rounded-lg border p-4 space-y-3">
              {hasSections ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    이미 목차가 생성되었습니다. 재생성 시 현재 목차가 대체됩니다.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => handleAction(onGenerate)}
                    disabled={isGenerating}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    재생성
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">RFP 배점표 기반 AI 자동 목차 생성</p>
                  <p className="text-sm text-muted-foreground">
                    Step 7(배분 가이드)의 평가항목 배점을 분석하여 최적의 목차 구조와 페이지 배분을 자동 생성합니다.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-3">
                    <li>&#x2022; 평가 배점에 비례한 챕터 구성</li>
                    <li>&#x2022; 챕터별 서브섹션 자동 생성 (3~8개)</li>
                    <li>&#x2022; 요구사항 ID 자동 매핑</li>
                  </ul>
                  <Button onClick={onGenerate} disabled={isGenerating}>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    목차 생성하기
                  </Button>
                </>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="template" className="mt-3">
          <div className="rounded-lg border p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              업종별 표준 템플릿을 선택하여 목차를 구성합니다.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {OUTLINE_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplate?.id === tpl.id;
                const sectionCount = countAllSections(tpl.sections);
                return (
                  <Card
                    key={tpl.id}
                    className={`p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-primary ring-1 ring-primary'
                        : 'hover:border-muted-foreground/30'
                    }`}
                    onClick={() => setSelectedTemplate(tpl)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {tpl.categoryLabel}
                      </Badge>
                      {isSelected && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-sm font-medium mb-1">{tpl.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tpl.sections.length}개 대분류 / {sectionCount}개 섹션
                    </p>
                  </Card>
                );
              })}
            </div>

            {selectedTemplate && (
              <Button
                onClick={() =>
                  handleAction(() =>
                    onApplyTemplate(structuredClone(selectedTemplate.sections)),
                  )
                }
              >
                <LayoutTemplate className="h-3.5 w-3.5 mr-1.5" />
                템플릿 적용하기
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>목차 교체 확인</AlertDialogTitle>
            <AlertDialogDescription>
              현재 편집된 목차가 모두 대체됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                pendingAction?.();
                setPendingAction(null);
              }}
            >
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function countAllSections(sections: OutlineSection[]): number {
  let count = sections.length;
  for (const s of sections) {
    if (s.children?.length) count += countAllSections(s.children);
  }
  return count;
}
