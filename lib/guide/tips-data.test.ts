import { describe, it, expect } from 'vitest';
import { STEP_TIPS, getStepTips } from './tips-data';

describe('tips-data', () => {
  it('모든 7단계에 팁이 존재해야 한다', () => {
    const stepKeys = ['upload', 'analysis', 'direction', 'strategy', 'outline', 'sections', 'output'];
    for (const key of stepKeys) {
      const tips = getStepTips(key);
      expect(tips.length).toBeGreaterThan(0);
    }
  });

  it('각 팁에 필수 필드가 있어야 한다', () => {
    for (const tip of STEP_TIPS) {
      expect(tip.id).toBeTruthy();
      expect(tip.stepKey).toBeTruthy();
      expect(tip.title).toBeTruthy();
      expect(tip.content).toBeTruthy();
      expect(['high', 'medium', 'low']).toContain(tip.importance);
      expect(['principle', 'public-bid', 'practical']).toContain(tip.category);
    }
  });

  it('존재하지 않는 단계는 빈 배열을 반환해야 한다', () => {
    expect(getStepTips('nonexistent')).toEqual([]);
  });
});
