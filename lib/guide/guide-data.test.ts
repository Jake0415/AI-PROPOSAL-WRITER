import { describe, it, expect } from 'vitest';
import { GUIDE_SECTIONS, getGuideSectionsByCategory } from './guide-data';

describe('guide-data', () => {
  it('3개 카테고리에 모두 데이터가 있어야 한다', () => {
    expect(getGuideSectionsByCategory('basic').length).toBeGreaterThan(0);
    expect(getGuideSectionsByCategory('public-bid').length).toBeGreaterThan(0);
    expect(getGuideSectionsByCategory('step-detail').length).toBeGreaterThan(0);
  });

  it('각 섹션에 필수 필드가 있어야 한다', () => {
    for (const section of GUIDE_SECTIONS) {
      expect(section.id).toBeTruthy();
      expect(section.title).toBeTruthy();
      expect(section.items.length).toBeGreaterThan(0);
      for (const item of section.items) {
        expect(item.title).toBeTruthy();
        expect(item.content).toBeTruthy();
        expect(item.tips.length).toBeGreaterThan(0);
      }
    }
  });

  it('카테고리별 정렬이 order 기준이어야 한다', () => {
    const basic = getGuideSectionsByCategory('basic');
    for (let i = 1; i < basic.length; i++) {
      expect(basic[i].order).toBeGreaterThanOrEqual(basic[i - 1].order);
    }
  });
});
