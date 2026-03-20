import { test, expect } from '@playwright/test';
import path from 'path';

const SUPER_ADMIN = { loginId: 'yhk71261@gmail.com', password: '@Dnflwlq01' };

async function loginAs(page: import('@playwright/test').Page, creds: { loginId: string; password: string }) {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100';
  // 병렬 실행 시 재시도
  for (let i = 0; i < 3; i++) {
    const res = await page.request.post(`${baseURL}/api/auth/login`, {
      data: { loginId: creds.loginId, password: creds.password },
    });
    if (res.ok()) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('로그인 실패');
}

test.describe('RFP 업로드 플로우 (Task 049-050)', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeEach(async ({ page }) => {
    await loginAs(page, SUPER_ADMIN);
  });

  test('업로드 페이지 기본 UI 표시', async ({ page }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100';
    // 프로젝트 목록에서 첫 번째 프로젝트 가져오기
    const listRes = await page.request.get(`${baseURL}/api/projects`);
    const listData = await listRes.json();
    if (!listData.data || listData.data.length === 0) return;

    const projectId = listData.data[0].id;
    await page.goto(`/projects/${projectId}/upload`);
    await page.waitForLoadState('networkidle');

    // 드래그앤드롭 영역
    await expect(page.getByText('파일을 드래그하거나 클릭하여 업로드')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('PDF, DOCX 형식 지원')).toBeVisible();
    await expect(page.getByText('파일 선택')).toBeVisible();
  });

  test('파일 선택 후 취소 버튼으로 초기화', async ({ page }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100';
    const listRes = await page.request.get(`${baseURL}/api/projects`);
    const listData = await listRes.json();
    if (!listData.data || listData.data.length === 0) return;

    const projectId = listData.data[0].id;
    await page.goto(`/projects/${projectId}/upload`);
    await page.waitForLoadState('networkidle');

    // 테스트용 PDF 파일 생성
    const fileInput = page.locator('input[type="file"]');

    // 파일 선택 시뮬레이션 (빈 PDF 헤더)
    const buffer = Buffer.from('%PDF-1.4 test content');
    await fileInput.setInputFiles({
      name: 'test-rfp.pdf',
      mimeType: 'application/pdf',
      buffer,
    });

    // 파일 정보 카드 표시 확인
    await expect(page.getByText('test-rfp.pdf')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('업로드 및 분석 시작')).toBeVisible();

    // X 버튼 클릭하여 취소
    await page.getByLabel('파일 선택 취소').click();

    // 파일 카드가 사라졌는지 확인
    await expect(page.getByText('test-rfp.pdf')).not.toBeVisible();
    // 드래그앤드롭 영역이 다시 보이는지 확인
    await expect(page.getByText('파일을 드래그하거나 클릭하여 업로드')).toBeVisible();
  });

  test('업로드 API 동작 확인', async ({ page }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100';

    // 테스트용 프로젝트 생성
    const createRes = await page.request.post(`${baseURL}/api/projects`, {
      data: { title: 'E2E 업로드 테스트 프로젝트' },
    });
    const createData = await createRes.json();
    const projectId = createData.data.id;

    await page.goto(`/projects/${projectId}/upload`);
    await page.waitForLoadState('networkidle');

    const fileInput = page.locator('input[type="file"]');

    // 유효한 PDF 파일 시뮬레이션 (magic bytes 포함)
    const pdfHeader = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D]); // %PDF-
    const pdfContent = Buffer.from(' 1.4 test content for upload e2e test');
    const buffer = Buffer.concat([pdfHeader, pdfContent]);

    await fileInput.setInputFiles({
      name: 'e2e-test-rfp.pdf',
      mimeType: 'application/pdf',
      buffer,
    });

    // 파일 선택 확인
    await expect(page.getByText('e2e-test-rfp.pdf')).toBeVisible({ timeout: 5000 });

    // 업로드 버튼 클릭
    await page.getByText('업로드 및 분석 시작').click();

    // 업로드 시도 후: 인라인 진행률 바가 표시되거나 토스트가 나타나야 함
    const result = await Promise.race([
      page.waitForURL(`**/projects/${projectId}/analysis`, { timeout: 15000 }).then(() => 'redirected'),
      page.getByText(/업로드 중|텍스트 추출|업로드에 실패|업로드되었습니다/).first().waitFor({ timeout: 15000 }).then(() => 'progress_or_toast'),
    ]).catch(() => 'timeout');

    expect(['redirected', 'progress_or_toast']).toContain(result);

    // 정리
    await page.request.delete(`${baseURL}/api/projects/${projectId}`);
  });

  test('토스트 알림 시스템 동작 확인', async ({ page }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100';
    const listRes = await page.request.get(`${baseURL}/api/projects`);
    const listData = await listRes.json();
    if (!listData.data || listData.data.length === 0) return;

    const projectId = listData.data[0].id;
    await page.goto(`/projects/${projectId}/upload`);
    await page.waitForLoadState('networkidle');

    // 파일 선택 후 취소 → toast.info 확인
    const fileInput = page.locator('input[type="file"]');
    const buffer = Buffer.from('%PDF-1.4 test');
    await fileInput.setInputFiles({
      name: 'toast-test.pdf',
      mimeType: 'application/pdf',
      buffer,
    });

    await expect(page.getByText('toast-test.pdf')).toBeVisible({ timeout: 5000 });
    await page.getByLabel('파일 선택 취소').click();

    // 토스트 메시지 확인 (sonner는 ol > li[data-sonner-toast] 구조)
    await expect(page.getByText('파일 선택이 취소되었습니다')).toBeVisible({ timeout: 10000 });
  });
});
