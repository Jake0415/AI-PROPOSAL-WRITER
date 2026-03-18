import { test, expect } from '@playwright/test';

test('헬스체크 API 응답', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.ok()).toBeTruthy();
});

test('미인증 사용자는 로그인 페이지로 리다이렉트', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/auth\/login/);
});

test('로그인 페이지가 표시된다', async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page.locator('text=로그인')).toBeVisible();
});

test('가이드 페이지는 공개 접근 가능', async ({ page }) => {
  await page.goto('/guide');
  await expect(page).toHaveURL(/\/guide/);
});
