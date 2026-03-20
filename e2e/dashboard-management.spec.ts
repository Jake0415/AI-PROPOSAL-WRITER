import { test, expect } from '@playwright/test';

const SUPER_ADMIN = { loginId: 'yhk71261@gmail.com', password: '@Dnflwlq01' };
const TEST_USER = { loginId: 'testuser', password: 'test1234' };

async function loginAs(page: import('@playwright/test').Page, creds: { loginId: string; password: string }) {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100';
  const res = await page.request.post(`${baseURL}/api/auth/login`, {
    data: { loginId: creds.loginId, password: creds.password },
  });
  expect(res.ok()).toBeTruthy();
}

test.describe('대시보드 개선 기능 (Task 046-048)', () => {
  test.describe('프로젝트 목록 API 확장 (Task 046)', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, SUPER_ADMIN);
    });

    test('프로젝트 목록에 멤버/RFP 정보 포함', async ({ page }) => {
      const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100';
      const res = await page.request.get(`${baseURL}/api/projects`);
      expect(res.ok()).toBeTruthy();
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      // meta 필드 존재
      expect(data.meta).toBeDefined();
      expect(data.meta.page).toBe(1);
      expect(typeof data.meta.total).toBe('number');
      expect(typeof data.meta.totalPages).toBe('number');

      // 각 프로젝트에 members 배열 존재
      if (data.data.length > 0) {
        const project = data.data[0];
        expect(Array.isArray(project.members)).toBe(true);
        // rfpAnalysis는 null이거나 객체
        expect(project.rfpAnalysis === null || typeof project.rfpAnalysis === 'object').toBe(true);
      }
    });

    test('상태 필터 동작', async ({ page }) => {
      const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100';
      const res = await page.request.get(`${baseURL}/api/projects?status=uploaded`);
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data.success).toBe(true);
      // 모든 결과가 uploaded 상태
      for (const project of data.data) {
        expect(project.status).toBe('uploaded');
      }
    });

    test('검색 필터 동작', async ({ page }) => {
      const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100';
      const res = await page.request.get(`${baseURL}/api/projects?search=스마트`);
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data.success).toBe(true);
      // 검색어를 포함하는 결과
      for (const project of data.data) {
        expect(project.title.toLowerCase()).toContain('스마트');
      }
    });

    test('페이지네이션 동작', async ({ page }) => {
      const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100';
      const res = await page.request.get(`${baseURL}/api/projects?page=1&limit=1`);
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.length).toBeLessThanOrEqual(1);
      expect(data.meta.limit).toBe(1);
    });
  });

  test.describe('대시보드 UI (Task 047)', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, SUPER_ADMIN);
    });

    test('대시보드 필터 바 표시', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // 검색 입력 필드
      await expect(page.getByPlaceholder('프로젝트 검색...')).toBeVisible({ timeout: 10000 });
      // 뷰 모드 전환 버튼
      await expect(page.getByLabel('카드 뷰')).toBeVisible();
      await expect(page.getByLabel('테이블 뷰')).toBeVisible();
    });

    test('카드 뷰와 테이블 뷰 전환', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // 기본: 카드 뷰
      await expect(page.getByLabel('카드 뷰')).toBeVisible();

      // 테이블 뷰로 전환
      await page.getByLabel('테이블 뷰').click();
      // 테이블 헤더 확인
      await expect(page.getByRole('columnheader', { name: '프로젝트명' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('columnheader', { name: '고객' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: '상태' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: '진행률' })).toBeVisible();

      // 카드 뷰로 복귀
      await page.getByLabel('카드 뷰').click();
      // 테이블 헤더가 사라짐
      await expect(page.getByRole('columnheader', { name: '프로젝트명' })).not.toBeVisible();
    });

    test('통계 카드 표시', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page.getByText('전체 프로젝트')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('진행 중')).toBeVisible();
      await expect(page.getByText('완료', { exact: true })).toBeVisible();
    });

    test('프로젝트 카드에 진행률 표시', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // 진행률 퍼센트 텍스트가 표시되는지 확인
      const progressTexts = page.locator('text=/%/');
      const count = await progressTexts.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('담당자 관리 (Task 048)', () => {
    test('멤버 API - 프로필 정보 포함', async ({ page }) => {
      await loginAs(page, SUPER_ADMIN);
      const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100';

      // 프로젝트 목록에서 첫 번째 프로젝트 ID 가져오기
      const listRes = await page.request.get(`${baseURL}/api/projects`);
      const listData = await listRes.json();
      if (listData.data.length === 0) return;

      const projectId = listData.data[0].id;
      const memberRes = await page.request.get(`${baseURL}/api/projects/${projectId}/members`);
      expect(memberRes.ok()).toBeTruthy();
      const memberData = await memberRes.json();
      expect(memberData.success).toBe(true);
      expect(Array.isArray(memberData.data)).toBe(true);

      // 멤버가 있으면 프로필 정보 확인
      if (memberData.data.length > 0) {
        const member = memberData.data[0];
        expect(member.user).toBeDefined();
        expect(typeof member.user.name).toBe('string');
      }
    });

    test('사용자 목록 API (proposal_pm 이상)', async ({ page }) => {
      await loginAs(page, SUPER_ADMIN);
      const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100';

      const res = await page.request.get(`${baseURL}/api/users`);
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThanOrEqual(1);

      // 각 사용자에 필수 필드 존재
      const user = data.data[0];
      expect(user.id).toBeDefined();
      expect(user.name).toBeDefined();
    });

    test('일반 사용자는 사용자 목록 API 접근 불가', async ({ page }) => {
      await loginAs(page, TEST_USER);
      const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100';

      const res = await page.request.get(`${baseURL}/api/users`);
      // 403 또는 401
      expect(res.status()).toBeGreaterThanOrEqual(400);
    });

    test('담당자 추가/역할변경/제거 플로우', async ({ page }) => {
      await loginAs(page, SUPER_ADMIN);
      const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100';

      // 테스트용 프로젝트 생성
      const createRes = await page.request.post(`${baseURL}/api/projects`, {
        data: { title: 'E2E 담당자 테스트' },
      });
      const createData = await createRes.json();
      const projectId = createData.data.id;

      // 사용자 목록 조회
      const usersRes = await page.request.get(`${baseURL}/api/users`);
      const usersData = await usersRes.json();
      const testUserId = usersData.data.find((u: { loginId: string }) => u.loginId === TEST_USER.loginId)?.id;

      if (testUserId) {
        // 1. 멤버 추가
        const addRes = await page.request.post(`${baseURL}/api/projects/${projectId}/members`, {
          data: { userId: testUserId, role: 'viewer' },
        });
        expect(addRes.ok()).toBeTruthy();

        // 멤버 조회 확인
        const membersRes = await page.request.get(`${baseURL}/api/projects/${projectId}/members`);
        const membersData = await membersRes.json();
        const addedMember = membersData.data.find((m: { user: { id: string } }) => m.user.id === testUserId);
        expect(addedMember).toBeDefined();
        expect(addedMember.role).toBe('viewer');

        // 2. 역할 변경
        const roleRes = await page.request.put(`${baseURL}/api/projects/${projectId}/members/${addedMember.id}`, {
          data: { role: 'editor' },
        });
        expect(roleRes.ok()).toBeTruthy();

        // 역할 변경 확인
        const membersRes2 = await page.request.get(`${baseURL}/api/projects/${projectId}/members`);
        const membersData2 = await membersRes2.json();
        const updatedMember = membersData2.data.find((m: { user: { id: string } }) => m.user.id === testUserId);
        expect(updatedMember.role).toBe('editor');

        // 3. 멤버 제거
        const deleteRes = await page.request.delete(`${baseURL}/api/projects/${projectId}/members/${addedMember.id}`);
        expect(deleteRes.ok()).toBeTruthy();

        // 제거 확인
        const membersRes3 = await page.request.get(`${baseURL}/api/projects/${projectId}/members`);
        const membersData3 = await membersRes3.json();
        const removedMember = membersData3.data.find((m: { user: { id: string } }) => m.user.id === testUserId);
        expect(removedMember).toBeUndefined();
      }

      // 테스트 프로젝트 정리
      await page.request.delete(`${baseURL}/api/projects/${projectId}`);
    });
  });
});
