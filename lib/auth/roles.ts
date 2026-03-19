import type { AppRole, ProjectRole } from '@/lib/db/schema';

// 앱 전체 권한 매트릭스
const APP_PERMISSIONS: Record<AppRole, string[]> = {
  super_admin: ['manage_users', 'manage_projects', 'view_admin', 'manage_settings', 'manage_templates', 'manage_system'],
  admin: ['manage_users', 'manage_projects', 'view_admin', 'manage_settings', 'manage_templates'],
  proposal_pm: ['manage_projects', 'manage_templates'],
  tech_writer: ['edit_sections', 'view_projects'],
  viewer: ['view_projects'],
};

// 프로젝트 내 권한 매트릭스
const PROJECT_PERMISSIONS: Record<ProjectRole, string[]> = {
  owner: ['edit', 'delete', 'manage_members', 'generate', 'export'],
  editor: ['edit', 'generate', 'export'],
  viewer: ['view', 'export'],
};

export function hasAppPermission(role: AppRole, permission: string): boolean {
  return APP_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasProjectPermission(role: ProjectRole, permission: string): boolean {
  return PROJECT_PERMISSIONS[role]?.includes(permission) ?? false;
}

// 역할 계층 (super_admin > admin > proposal_pm > tech_writer > viewer)
const ROLE_HIERARCHY: Record<AppRole, number> = {
  super_admin: 5,
  admin: 4,
  proposal_pm: 3,
  tech_writer: 2,
  viewer: 1,
};

export function isRoleAtLeast(userRole: AppRole, requiredRole: AppRole): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

// 역할 라벨 (UI 표시용)
export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: '최고관리자',
  admin: '관리자',
  proposal_pm: '제안PM',
  tech_writer: '기술작성자',
  viewer: '뷰어',
};

// 사용자 등록 시 선택 가능한 역할 (super_admin 제외)
export const ASSIGNABLE_ROLES: AppRole[] = ['admin', 'proposal_pm', 'tech_writer', 'viewer'];
