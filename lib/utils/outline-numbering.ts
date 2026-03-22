import type { OutlineSection } from '@/lib/ai/types';

/**
 * 목차 트리의 각 섹션에 대해 동적 번호를 계산한다.
 * 번호는 title에 저장하지 않고 렌더링 시에만 사용한다.
 *
 * @returns Map<sectionId, numbering> 예: "sec-1" → "1", "sec-1-2" → "1.2"
 */
export function computeNumbering(
  sections: OutlineSection[],
  parentPrefix = '',
): Map<string, string> {
  const map = new Map<string, string>();

  sections.forEach((section, index) => {
    const num = parentPrefix
      ? `${parentPrefix}.${index + 1}`
      : `${index + 1}`;
    map.set(section.id, num);

    if (section.children?.length) {
      const childMap = computeNumbering(section.children, num);
      childMap.forEach((v, k) => map.set(k, v));
    }
  });

  return map;
}

/** 전체 섹션 수 (재귀) */
export function countSections(sections: OutlineSection[]): number {
  let count = sections.length;
  for (const s of sections) {
    if (s.children?.length) {
      count += countSections(s.children);
    }
  }
  return count;
}

/** 대분류(level 0)의 estimatedPages 합계 */
export function sumPages(sections: OutlineSection[]): number {
  return sections
    .filter((s) => s.level === 0)
    .reduce((sum, s) => sum + (s.estimatedPages ?? 0), 0);
}
