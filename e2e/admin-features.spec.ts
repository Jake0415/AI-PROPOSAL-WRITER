import { test, expect } from '@playwright/test';

const ADMIN = { loginId: 'yhk71261@gmail.com', password: '@Dnflwlq01' };

async function login(page: import('@playwright/test').Page) {
  const baseURL = page.url().startsWith('http') ? new URL(page.url()).origin : 'http://localhost:3100';
  const res = await page.request.post(`${baseURL}/api/auth/login`, {
    data: { loginId: ADMIN.loginId, password: ADMIN.password },
  });
  expect(res.ok()).toBeTruthy();
}

test.describe('관리자 기능', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('커스터마이징 페이지 접근', async ({ page }) => {
    await page.goto('/admin/customization');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
    await expect(page.locator('body')).not.toContainText('500');
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('감사 로그 페이지 접근', async ({ page }) => {
    await page.goto('/admin/audit');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('데이터 관리 페이지 접근', async ({ page }) => {
    await page.goto('/admin/data');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('사용자 관리 페이지 - 사용자 목록 표시', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
    // 시드 데이터 사용자가 표시되어야 함
    await expect(page.getByRole('cell', { name: '최고관리자' }).first()).toBeVisible({ timeout: 10000 });
  });

  test('관리자 대시보드 - 통계 표시', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});
