import { describe, it, expect } from 'vitest';
import { hasAppPermission, hasProjectPermission, isRoleAtLeast } from './roles';

describe('hasAppPermission', () => {
  it('super_admin은 모든 권한을 가진다', () => {
    expect(hasAppPermission('super_admin', 'manage_users')).toBe(true);
    expect(hasAppPermission('super_admin', 'manage_system')).toBe(true);
    expect(hasAppPermission('super_admin', 'manage_projects')).toBe(true);
  });

  it('admin은 시스템 관리를 제외한 권한을 가진다', () => {
    expect(hasAppPermission('admin', 'manage_users')).toBe(true);
    expect(hasAppPermission('admin', 'manage_projects')).toBe(true);
    expect(hasAppPermission('admin', 'view_admin')).toBe(true);
    expect(hasAppPermission('admin', 'manage_system')).toBe(false);
  });

  it('viewer는 view_projects만 가진다', () => {
    expect(hasAppPermission('viewer', 'view_projects')).toBe(true);
    expect(hasAppPermission('viewer', 'manage_projects')).toBe(false);
    expect(hasAppPermission('viewer', 'manage_users')).toBe(false);
  });

  it('proposal_pm은 프로젝트와 템플릿을 관리할 수 있다', () => {
    expect(hasAppPermission('proposal_pm', 'manage_projects')).toBe(true);
    expect(hasAppPermission('proposal_pm', 'manage_templates')).toBe(true);
    expect(hasAppPermission('proposal_pm', 'manage_users')).toBe(false);
  });
});

describe('hasProjectPermission', () => {
  it('owner는 모든 프로젝트 권한을 가진다', () => {
    expect(hasProjectPermission('owner', 'edit')).toBe(true);
    expect(hasProjectPermission('owner', 'delete')).toBe(true);
    expect(hasProjectPermission('owner', 'manage_members')).toBe(true);
  });

  it('viewer는 view와 export만 가능하다', () => {
    expect(hasProjectPermission('viewer', 'view')).toBe(true);
    expect(hasProjectPermission('viewer', 'export')).toBe(true);
    expect(hasProjectPermission('viewer', 'edit')).toBe(false);
  });
});

describe('isRoleAtLeast', () => {
  it('같은 역할은 true', () => {
    expect(isRoleAtLeast('admin', 'admin')).toBe(true);
    expect(isRoleAtLeast('viewer', 'viewer')).toBe(true);
  });

  it('상위 역할은 true', () => {
    expect(isRoleAtLeast('super_admin', 'admin')).toBe(true);
    expect(isRoleAtLeast('admin', 'viewer')).toBe(true);
    expect(isRoleAtLeast('proposal_pm', 'tech_writer')).toBe(true);
  });

  it('하위 역할은 false', () => {
    expect(isRoleAtLeast('viewer', 'admin')).toBe(false);
    expect(isRoleAtLeast('tech_writer', 'proposal_pm')).toBe(false);
  });
});
