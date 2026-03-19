import { test, expect } from '@playwright/test';

const ADMIN = { loginId: 'yhk71261@gmail.com', password: '@Dnflwlq01' };

async function login(page: import('@playwright/test').Page) {
  const baseURL = page.url().startsWith('http') ? new URL(page.url()).origin : 'http://localhost:3100';
  const res = await page.request.post(`${baseURL}/api/auth/login`, {
    data: { loginId: ADMIN.loginId, password: ADMIN.password },
  });
  expect(res.ok()).toBeTruthy();
}

test.describe('프롬프트 관리', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('프롬프트 목록 페이지 - 9개 프롬프트 표시', async ({ page }) => {
    await page.goto('/admin/prompts');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
    await expect(page.getByText('프롬프트 관리')).toBeVisible({ timeout: 10000 });
    // 9개 프롬프트 카드가 존재해야 함
    // 9개 프롬프트 카드 제목이 존재해야 함
    const cards = page.locator('[data-slot="card-title"]');
    await expect(cards).toHaveCount(9, { timeout: 10000 });
  });

  test('카테고리 필터 동작', async ({ page }) => {
    await page.goto('/admin/prompts');
    await page.waitForLoadState('networkidle');
    // '분석' 필터 클릭
    await page.getByRole('button', { name: '분석' }).click();
    const filteredCards = page.locator('[data-slot="card-title"]');
    await expect(filteredCards).toHaveCount(2, { timeout: 5000 });
    // '전체' 필터로 복원
    await page.getByRole('button', { name: '전체' }).click();
    await expect(filteredCards).toHaveCount(9, { timeout: 5000 });
  });

  test('프롬프트 상세 페이지 접근', async ({ page }) => {
    await page.goto('/admin/prompts/rfp-analysis');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
    await expect(page.getByText('RFP 분석')).toBeVisible({ timeout: 10000 });
    // System Prompt textarea가 존재
    await expect(page.locator('textarea').first()).toBeVisible();
  });

  test('프롬프트 API - 목록 조회', async ({ page }) => {
    const baseURL = 'http://localhost:3100';
    const res = await page.request.get(`${baseURL}/api/admin/prompts`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.length).toBeGreaterThanOrEqual(9);
  });

  test('프롬프트 API - 개별 조회', async ({ page }) => {
    const baseURL = 'http://localhost:3100';
    const res = await page.request.get(`${baseURL}/api/admin/prompts/rfp-analysis`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.slug).toBe('rfp-analysis');
    expect(data.data.systemPrompt).toBeTruthy();
  });
});
