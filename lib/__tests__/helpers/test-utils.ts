import type { AppRole } from '@/lib/db/schema';

// 테스트용 사용자 데이터 생성
export function createTestUser(overrides?: Partial<{
  id: string;
  email: string;
  role: AppRole;
}>) {
  return {
    id: overrides?.id ?? `test-user-${Math.random().toString(36).slice(2, 8)}`,
    email: overrides?.email ?? `test-${Date.now()}@example.com`,
    role: overrides?.role ?? 'viewer' as AppRole,
  };
}

// 테스트용 프로젝트 데이터 생성
export function createTestProject(overrides?: Partial<{
  id: string;
  title: string;
  status: string;
}>) {
  return {
    id: overrides?.id ?? `test-project-${Math.random().toString(36).slice(2, 8)}`,
    title: overrides?.title ?? `테스트 프로젝트 ${Date.now()}`,
    status: overrides?.status ?? 'uploaded',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// API 응답 형식 검증
export function expectApiSuccess(data: unknown) {
  const response = data as { success: boolean };
  if (!response.success) {
    throw new Error(`API 응답이 success: false입니다`);
  }
}

export function expectApiError(data: unknown, expectedCode?: string) {
  const response = data as { success: boolean; error?: { code: string } };
  if (response.success) {
    throw new Error(`API 응답이 success: true입니다 (에러 예상)`);
  }
  if (expectedCode && response.error?.code !== expectedCode) {
    throw new Error(`에러 코드 불일치: ${response.error?.code} !== ${expectedCode}`);
  }
}
