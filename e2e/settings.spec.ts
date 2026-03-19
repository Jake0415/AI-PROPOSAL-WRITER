import { test, expect } from '@playwright/test';

const ADMIN = { loginId: 'yhk71261@gmail.com', password: '@Dnflwlq01' };

async function login(page: import('@playwright/test').Page) {
  const baseURL = page.url().startsWith('http') ? new URL(page.url()).origin : 'http://localhost:3100';
  const res = await page.request.post(`${baseURL}/api/auth/login`, {
    data: { loginId: ADMIN.loginId, password: ADMIN.password },
  });
  expect(res.ok()).toBeTruthy();
}

test.describe('AI 설정', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('설정 페이지 접근 - 프로바이더 선택 UI', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('AI 설정 API - 조회', async ({ page }) => {
    const baseURL = 'http://localhost:3100';
    const res = await page.request.get(`${baseURL}/api/settings/ai`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.provider).toBeTruthy();
  });
});
