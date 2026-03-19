import { test, expect } from '@playwright/test';

// 시드 계정 정보
const SUPER_ADMIN = { loginId: 'superadmin', password: 'admin1234' };
const ADMIN = { loginId: 'admin', password: 'admin1234' };
const TEST_USER = { loginId: 'testuser', password: 'test1234' };

test.describe('인증 플로우', () => {
  test('최고관리자 로그인 성공', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#loginId', SUPER_ADMIN.loginId);
    await page.fill('#password', SUPER_ADMIN.password);
    await page.getByRole('button', { name: '로그인' }).click();
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');
  });

  test('관리자 로그인 성공', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#loginId', ADMIN.loginId);
    await page.fill('#password', ADMIN.password);
    await page.getByRole('button', { name: '로그인' }).click();
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');
  });

  test('잘못된 비밀번호로 로그인 실패', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#loginId', ADMIN.loginId);
    await page.fill('#password', 'wrongpassword');
    await page.getByRole('button', { name: '로그인' }).click();
    await expect(page.getByText(/올바르지 않습니다|실패/)).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('회원가입 페이지는 로그인으로 리다이렉트', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('관리자 사용자 관리 페이지 접근', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#loginId', SUPER_ADMIN.loginId);
    await page.fill('#password', SUPER_ADMIN.password);
    await page.getByRole('button', { name: '로그인' }).click();
    await page.waitForURL('/', { timeout: 10000 });

    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/admin\/users/);
    // 사용자 목록 테이블이 보여야 함
    await expect(page.getByText('superadmin')).toBeVisible({ timeout: 5000 });
  });

  test('일반 사용자 로그인 후 로그아웃', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#loginId', TEST_USER.loginId);
    await page.fill('#password', TEST_USER.password);
    await page.getByRole('button', { name: '로그인' }).click();
    await page.waitForURL('/', { timeout: 10000 });

    // 로그아웃
    const logoutBtn = page.getByRole('button', { name: /로그아웃/ }).or(page.locator('[title="로그아웃"]'));
    if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForURL(/\/auth\/login/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/auth\/login/);
    }
  });
});
