import type { OutlineSection } from '@/lib/ai/types';

/** 새 섹션 ID 생성 */
function newId(): string {
  return `sec-${crypto.randomUUID().slice(0, 8)}`;
}

/** 루트(대분류)에 빈 섹션 추가 */
export function addRootSection(sections: OutlineSection[]): OutlineSection[] {
  return [
    ...sections,
    {
      id: newId(),
      title: '',
      level: 0,
      order: sections.length + 1,
      children: [],
    },
  ];
}

/** 특정 부모 아래에 하위 섹션 추가 */
export function addChildSection(
  sections: OutlineSection[],
  parentId: string,
): OutlineSection[] {
  return sections.map((s) => {
    if (s.id === parentId) {
      const children = [
        ...(s.children ?? []),
        {
          id: newId(),
          title: '',
          level: s.level + 1,
          order: (s.children?.length ?? 0) + 1,
          children: [],
        },
      ];
      return { ...s, children };
    }
    if (s.children?.length) {
      return { ...s, children: addChildSection(s.children, parentId) };
    }
    return s;
  });
}

/** 섹션 업데이트 (재귀 탐색) */
export function updateSection(
  sections: OutlineSection[],
  id: string,
  updates: Partial<OutlineSection>,
): OutlineSection[] {
  return sections.map((s) => {
    if (s.id === id) {
      return { ...s, ...updates };
    }
    if (s.children?.length) {
      return { ...s, children: updateSection(s.children, id, updates) };
    }
    return s;
  });
}

/** 섹션 삭제 (재귀 탐색) + order 재계산 */
export function removeSection(
  sections: OutlineSection[],
  id: string,
): OutlineSection[] {
  const filtered = sections.filter((s) => s.id !== id);

  if (filtered.length !== sections.length) {
    return recomputeOrder(filtered);
  }

  return filtered.map((s) => {
    if (s.children?.length) {
      return { ...s, children: removeSection(s.children, id) };
    }
    return s;
  });
}

/** 같은 부모 내에서 순서 변경 (dragId를 targetId 위치로 이동) */
export function reorderSection(
  sections: OutlineSection[],
  dragId: string,
  targetId: string,
): OutlineSection[] {
  const dragIdx = sections.findIndex((s) => s.id === dragId);
  const dropIdx = sections.findIndex((s) => s.id === targetId);

  if (dragIdx !== -1 && dropIdx !== -1) {
    const updated = [...sections];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(dropIdx, 0, moved);
    return recomputeOrder(updated);
  }

  return sections.map((s) => {
    if (s.children?.length) {
      return { ...s, children: reorderSection(s.children, dragId, targetId) };
    }
    return s;
  });
}

/** order 필드를 1-based로 재계산 */
function recomputeOrder(sections: OutlineSection[]): OutlineSection[] {
  return sections.map((s, i) => ({ ...s, order: i + 1 }));
}

/** 배점 기반 페이지 자동 배분 (대→중→소 재귀) */
export function autoAllocatePages(
  sections: OutlineSection[],
  totalPages: number,
): OutlineSection[] {
  const topSections = sections.filter((s) => s.level === 0);
  const totalScore = topSections.reduce((sum, s) => sum + (s.evalScore ?? 0), 0);
  const scoredCount = topSections.filter((s) => s.evalScore).length;
  const unscoredCount = topSections.length - scoredCount;

  let scoredPagesUsed = 0;

  const allocated = sections.map((s) => {
    if (s.level !== 0) return s;

    let pages: number;
    if (s.evalScore && totalScore > 0) {
      pages = Math.max(1, Math.round(totalPages * (s.evalScore / totalScore)));
      scoredPagesUsed += pages;
    } else if (unscoredCount > 0) {
      const remaining = totalPages - scoredPagesUsed;
      pages = Math.max(1, Math.round(remaining / unscoredCount));
    } else {
      pages = Math.max(1, Math.round(totalPages / topSections.length));
    }

    const updated = { ...s, estimatedPages: pages };
    if (updated.children?.length) {
      updated.children = distributeToChildren(updated.children, pages);
    }
    return updated;
  });

  return allocated;
}

/** 부모 페이지를 children에 균등 배분 (재귀) */
function distributeToChildren(
  children: OutlineSection[],
  parentPages: number,
): OutlineSection[] {
  if (children.length === 0) return children;

  const perChild = Math.max(1, Math.floor(parentPages / children.length));
  let remainder = parentPages - perChild * children.length;

  return children.map((child, i) => {
    const extra = i === 0 && remainder > 0 ? remainder : 0;
    if (i === 0) remainder = 0;
    const pages = perChild + extra;
    const updated = { ...child, estimatedPages: pages };
    if (updated.children?.length) {
      updated.children = distributeToChildren(updated.children, pages);
    }
    return updated;
  });
}

/** 특정 섹션의 children 개수 (직속 + 재귀) */
export function countDescendants(section: OutlineSection): number {
  let count = section.children?.length ?? 0;
  for (const child of section.children ?? []) {
    count += countDescendants(child);
  }
  return count;
}

/** 섹션 ID로 찾기 (재귀) */
export function findSection(
  sections: OutlineSection[],
  id: string,
): OutlineSection | undefined {
  for (const s of sections) {
    if (s.id === id) return s;
    if (s.children?.length) {
      const found = findSection(s.children, id);
      if (found) return found;
    }
  }
  return undefined;
}
