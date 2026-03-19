import { test, expect } from '@playwright/test';

const ADMIN = { loginId: 'yhk71261@gmail.com', password: '@Dnflwlq01' };

async function login(page: import('@playwright/test').Page) {
  const baseURL = page.url().startsWith('http') ? new URL(page.url()).origin : 'http://localhost:3100';
  const res = await page.request.post(`${baseURL}/api/auth/login`, {
    data: { loginId: ADMIN.loginId, password: ADMIN.password },
  });
  expect(res.ok()).toBeTruthy();
}

test.describe('템플릿 관리', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('템플릿 페이지 접근 - 업로드 버튼 표시', async ({ page }) => {
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
    await expect(page.getByText('템플릿 관리')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('템플릿 업로드')).toBeVisible();
  });

  test('템플릿 API - 목록 조회', async ({ page }) => {
    const baseURL = 'http://localhost:3100';
    const res = await page.request.get(`${baseURL}/api/templates`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
