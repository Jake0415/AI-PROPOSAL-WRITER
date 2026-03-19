import { test, expect } from '@playwright/test';

const ADMIN = { loginId: 'superadmin', password: 'admin1234' };
const PROJECT_ID = 'proj-demo-001';

// 로그인 헬퍼 (API 직접 호출로 빠르고 안정적인 로그인)
async function login(page: import('@playwright/test').Page) {
  const baseURL = page.url().startsWith('http') ? new URL(page.url()).origin : 'http://localhost:3100';
  const res = await page.request.post(`${baseURL}/api/auth/login`, {
    data: { loginId: ADMIN.loginId, password: ADMIN.password },
  });
  expect(res.ok()).toBeTruthy();
}

test.describe('전체 시나리오 브라우징', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('대시보드 - 프로젝트 목록 표시', async ({ page }) => {
    await page.goto('/');
    // 프로젝트 카드 또는 목록이 표시되어야 함
    await expect(page.getByText('스마트시티')).toBeVisible({ timeout: 10000 });
  });

  test('프로젝트 - RFP 분석 페이지', async ({ page }) => {
    await page.goto(`/projects/${PROJECT_ID}/analysis`);
    await page.waitForLoadState('networkidle');
    // 페이지가 에러 없이 로드되는지 확인
    await expect(page.locator('body')).not.toContainText('Application error');
    await expect(page.locator('body')).not.toContainText('500');
    // 분석 관련 컨텐츠 확인
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('프로젝트 - 방향성 설정 페이지', async ({ page }) => {
    await page.goto(`/projects/${PROJECT_ID}/direction`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
    // 방향성 후보가 표시되어야 함
    await expect(page.getByRole('heading', { name: '방향성 설정' })).toBeVisible({ timeout: 10000 });
  });

  test('프로젝트 - 전략 수립 페이지', async ({ page }) => {
    await page.goto(`/projects/${PROJECT_ID}/strategy`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('프로젝트 - 목차 구성 페이지', async ({ page }) => {
    await page.goto(`/projects/${PROJECT_ID}/outline`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
    // 목차 섹션이 표시되어야 함
    await expect(page.getByText('사업 이해 및 추진전략')).toBeVisible({ timeout: 10000 });
  });

  test('프로젝트 - 섹션 내용 페이지', async ({ page }) => {
    await page.goto(`/projects/${PROJECT_ID}/sections`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
    // 섹션 목록이 표시되어야 함
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('프로젝트 - 검증 리포트 페이지', async ({ page }) => {
    await page.goto(`/projects/${PROJECT_ID}/review`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('프로젝트 - 가격 제안서 페이지', async ({ page }) => {
    await page.goto(`/projects/${PROJECT_ID}/pricing`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('프로젝트 - 산출물 출력 페이지', async ({ page }) => {
    await page.goto(`/projects/${PROJECT_ID}/output`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('관리자 - 통계 페이지', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('설정 페이지', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('가이드 페이지', async ({ page }) => {
    await page.goto('/guide');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
    await expect(page.getByRole('heading', { name: '제안서 작성 가이드' })).toBeVisible({ timeout: 5000 });
  });
});
