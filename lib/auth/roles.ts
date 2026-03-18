import type { AppRole, ProjectRole } from '@/lib/db/schema';

// 앱 전체 권한 매트릭스
const APP_PERMISSIONS: Record<AppRole, string[]> = {
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

// 역할 계층 (admin > proposal_pm > tech_writer > viewer)
const ROLE_HIERARCHY: Record<AppRole, number> = {
  admin: 4,
  proposal_pm: 3,
  tech_writer: 2,
  viewer: 1,
};

export function isRoleAtLeast(userRole: AppRole, requiredRole: AppRole): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}
