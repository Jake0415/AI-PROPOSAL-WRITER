'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Pencil, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OutlineSection, EvaluationCriterion } from '@/lib/ai/types';

interface OutlineTreeNodeProps {
  section: OutlineSection;
  numbering: string;
  depth: number;
  criteria?: EvaluationCriterion[];
  dragId: string | null;
  newSectionId: string | null;
  onDragStart: (id: string) => void;
  onDrop: (targetId: string) => void;
  onUpdate: (id: string, updates: Partial<OutlineSection>) => void;
  onAddChild: (parentId: string) => void;
  onRemove: (id: string) => void;
  numberingMap: Map<string, string>;
}

export function OutlineTreeNode({
  section,
  numbering,
  depth,
  criteria,
  dragId,
  newSectionId,
  onDragStart,
  onDrop,
  onUpdate,
  onAddChild,
  onRemove,
  numberingMap,
}: OutlineTreeNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isNew = newSectionId === section.id;

  useEffect(() => {
    if (isNew && !section.title) {
      setIsEditing(true);
    }
  }, [isNew, section.title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const confirmEdit = useCallback(() => {
    const trimmed = editTitle.trim();
    if (trimmed !== section.title) {
      onUpdate(section.id, { title: trimmed });
    }
    setIsEditing(false);
  }, [editTitle, section.title, section.id, onUpdate]);

  const cancelEdit = useCallback(() => {
    setEditTitle(section.title);
    setIsEditing(false);
  }, [section.title]);

  const handleDelete = () => {
    const descendants = countAll(section.children ?? []);
    if (descendants > 0) {
      setShowDeleteConfirm(true);
    } else {
      onRemove(section.id);
    }
  };

  const isLevel0 = depth === 0;
  const isDragging = dragId === section.id;

  return (
    <>
      <div
        draggable={!isEditing}
        onDragStart={(e) => {
          e.stopPropagation();
          onDragStart(section.id);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.stopPropagation();
          onDrop(section.id);
        }}
        className={cn(
          'flex items-center gap-2 py-1.5 px-2 rounded-md text-sm transition-colors group',
          isDragging && 'opacity-40 bg-muted',
          !isDragging && 'hover:bg-muted/50',
        )}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {/* Drag handle */}
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100 cursor-grab" />

        {/* Numbering */}
        <span className={cn(
          'font-mono shrink-0 text-muted-foreground',
          isLevel0 ? 'text-sm font-semibold w-8' : 'text-xs w-12',
        )}>
          {numbering}
        </span>

        {/* Title */}
        {isEditing ? (
          <Input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={confirmEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            className="h-7 text-sm flex-1"
            placeholder="제목을 입력하세요"
          />
        ) : (
          <span
            className={cn(
              'flex-1 truncate cursor-pointer',
              isLevel0 ? 'font-medium' : 'text-sm',
              !section.title && 'text-muted-foreground italic',
            )}
            onDoubleClick={() => {
              setEditTitle(section.title);
              setIsEditing(true);
            }}
          >
            {section.title || '(제목 없음)'}
          </span>
        )}

        {/* Eval badge (level 0 only) */}
        {isLevel0 && criteria && criteria.length > 0 && (
          <select
            value={section.evalItemId ?? ''}
            onChange={(e) => {
              const key = e.target.value;
              const criterion = criteria.find((c) => `${c.category}-${c.item}` === key);
              onUpdate(section.id, {
                evalItemId: key || undefined,
                evalScore: criterion?.score,
              });
            }}
            className="h-7 rounded-md border bg-background px-1.5 text-xs max-w-[180px] shrink-0"
          >
            <option value="">매핑 안 됨</option>
            {criteria.map((c) => {
              const key = `${c.category}-${c.item}`;
              return (
                <option key={key} value={key}>
                  [{c.category}] {c.item} ({c.score}점)
                </option>
              );
            })}
          </select>
        )}

        {isLevel0 && section.evalScore && (
          <Badge variant="outline" className="text-[10px] shrink-0">
            {section.evalScore}점
          </Badge>
        )}

        {/* Action buttons (hover) */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => {
              setEditTitle(section.title);
              setIsEditing(true);
            }}
            title="편집"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onAddChild(section.id)}
            title="하위 추가"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={handleDelete}
            title="삭제"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Pages input */}
        <div className="flex items-center gap-1 shrink-0">
          <Input
            type="number"
            value={section.estimatedPages ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? undefined : Number(e.target.value);
              onUpdate(section.id, { estimatedPages: val });
            }}
            className="h-7 w-14 text-xs text-right"
            min={0}
            placeholder="-"
          />
          <span className="text-[10px] text-muted-foreground">p</span>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="mx-4 my-1 p-3 rounded-md border border-destructive/50 bg-destructive/5" style={{ marginLeft: `${depth * 24 + 32}px` }}>
          <p className="text-xs font-medium text-destructive mb-2">
            &quot;{numbering} {section.title}&quot; 삭제
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            하위 {countAll(section.children ?? [])}개 항목도 함께 삭제됩니다.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => setShowDeleteConfirm(false)}>
              취소
            </Button>
            <Button size="sm" variant="destructive" className="h-6 text-xs" onClick={() => {
              setShowDeleteConfirm(false);
              onRemove(section.id);
            }}>
              삭제
            </Button>
          </div>
        </div>
      )}

      {/* Children */}
      {section.children?.map((child) => (
        <OutlineTreeNode
          key={child.id}
          section={child}
          numbering={numberingMap.get(child.id) ?? ''}
          depth={depth + 1}
          criteria={criteria}
          dragId={dragId}
          newSectionId={newSectionId}
          onDragStart={onDragStart}
          onDrop={onDrop}
          onUpdate={onUpdate}
          onAddChild={onAddChild}
          onRemove={onRemove}
          numberingMap={numberingMap}
        />
      ))}

      {/* Add child button for level 0 */}
      {isLevel0 && (
        <>
          <div
            className="flex items-center py-1 opacity-0 hover:opacity-100 transition-opacity"
            style={{ paddingLeft: `${(depth + 1) * 24 + 8}px` }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-muted-foreground"
              onClick={() => onAddChild(section.id)}
            >
              <Plus className="h-3 w-3 mr-1" />
              중분류 추가
            </Button>
          </div>
          <div className="border-b my-1" />
        </>
      )}
    </>
  );
}

function countAll(sections: OutlineSection[]): number {
  let n = sections.length;
  for (const s of sections) {
    if (s.children?.length) n += countAll(s.children);
  }
  return n;
}
