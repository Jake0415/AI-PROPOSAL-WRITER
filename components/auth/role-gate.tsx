'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { isRoleAtLeast } from '@/lib/auth/roles';
import type { AppRole } from '@/lib/db/schema';

interface RoleGateProps {
  minRole: AppRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ minRole, children, fallback = null }: RoleGateProps) {
  const { profile } = useAuth();
  const userRole = (profile?.role as AppRole) ?? 'viewer';

  if (!isRoleAtLeast(userRole, minRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
