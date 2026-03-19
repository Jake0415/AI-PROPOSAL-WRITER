import { test, expect } from '@playwright/test';

const ADMIN = { loginId: 'yhk71261@gmail.com', password: '@Dnflwlq01' };

async function login(page: import('@playwright/test').Page) {
  const baseURL = page.url().startsWith('http') ? new URL(page.url()).origin : 'http://localhost:3100';
  const res = await page.request.post(`${baseURL}/api/auth/login`, {
    data: { loginId: ADMIN.loginId, password: ADMIN.password },
  });
  expect(res.ok()).toBeTruthy();
}

test.describe('프로젝트 CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('프로젝트 생성 API', async ({ page }) => {
    const baseURL = 'http://localhost:3100';
    const res = await page.request.post(`${baseURL}/api/projects`, {
      data: { title: 'E2E 테스트 프로젝트' },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.title).toBe('E2E 테스트 프로젝트');

    // 생성된 프로젝트 삭제 (cleanup)
    if (data.data.id) {
      await page.request.delete(`${baseURL}/api/projects/${data.data.id}`);
    }
  });

  test('프로젝트 목록 조회 API', async ({ page }) => {
    const baseURL = 'http://localhost:3100';
    const res = await page.request.get(`${baseURL}/api/projects`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThanOrEqual(1);
  });

  test('대시보드에서 프로젝트 표시', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('스마트시티')).toBeVisible({ timeout: 10000 });
  });
});
