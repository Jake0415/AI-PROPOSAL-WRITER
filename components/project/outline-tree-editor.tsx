'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Save } from 'lucide-react';
import type { OutlineSection, EvaluationCriterion } from '@/lib/ai/types';
import { OutlineTreeNode } from './outline-tree-node';
import { computeNumbering, countSections } from '@/lib/utils/outline-numbering';
import {
  addRootSection,
  addChildSection,
  updateSection,
  removeSection,
  reorderSection,
} from '@/lib/utils/outline-helpers';

interface OutlineTreeEditorProps {
  sections: OutlineSection[];
  criteria: EvaluationCriterion[];
  onChange: (sections: OutlineSection[]) => void;
  saving?: boolean;
}

export function OutlineTreeEditor({
  sections,
  criteria,
  onChange,
  saving,
}: OutlineTreeEditorProps) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [newSectionId, setNewSectionId] = useState<string | null>(null);

  const numberingMap = useMemo(() => computeNumbering(sections), [sections]);
  const totalCount = useMemo(() => countSections(sections), [sections]);

  const handleDragStart = useCallback((id: string) => setDragId(id), []);

  const handleDrop = useCallback(
    (targetId: string) => {
      if (!dragId || dragId === targetId) {
        setDragId(null);
        return;
      }
      onChange(reorderSection(sections, dragId, targetId));
      setDragId(null);
    },
    [dragId, sections, onChange],
  );

  const handleUpdate = useCallback(
    (id: string, updates: Partial<OutlineSection>) => {
      onChange(updateSection(sections, id, updates));
    },
    [sections, onChange],
  );

  const handleAddRoot = useCallback(() => {
    const updated = addRootSection(sections);
    const newId = updated[updated.length - 1].id;
    setNewSectionId(newId);
    onChange(updated);
  }, [sections, onChange]);

  const handleAddChild = useCallback(
    (parentId: string) => {
      const updated = addChildSection(sections, parentId);
      // Find the newly added child
      const findNewChild = (items: OutlineSection[]): string | null => {
        for (const s of items) {
          if (s.id === parentId && s.children?.length) {
            return s.children[s.children.length - 1].id;
          }
          if (s.children?.length) {
            const found = findNewChild(s.children);
            if (found) return found;
          }
        }
        return null;
      };
      setNewSectionId(findNewChild(updated));
      onChange(updated);
    },
    [sections, onChange],
  );

  const handleRemove = useCallback(
    (id: string) => {
      onChange(removeSection(sections, id));
    },
    [sections, onChange],
  );

  if (sections.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-lg">제안서 목차</CardTitle>
          <CardDescription>
            총 {totalCount}개 섹션 구성
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground animate-pulse">
              <Save className="h-3 w-3" />
              저장 중...
            </span>
          )}
        </div>
      </CardHeader>

      <div className="px-4 pb-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={handleAddRoot}
        >
          <Plus className="h-3 w-3 mr-1" />
          대분류 추가
        </Button>
      </div>

      <div className="px-2 pb-4">
        {sections.map((section) => (
          <OutlineTreeNode
            key={section.id}
            section={section}
            numbering={numberingMap.get(section.id) ?? ''}
            depth={0}
            criteria={criteria}
            dragId={dragId}
            newSectionId={newSectionId}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onUpdate={handleUpdate}
            onAddChild={handleAddChild}
            onRemove={handleRemove}
            numberingMap={numberingMap}
          />
        ))}
      </div>
    </Card>
  );
}
