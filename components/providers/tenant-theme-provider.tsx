'use client';

import { useEffect } from 'react';

export function TenantThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    fetch('/api/settings/tenant')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success || !data.data) return;
        const { primaryColor } = data.data;
        if (primaryColor) {
          document.documentElement.style.setProperty('--tenant-primary', primaryColor);
        }
      })
      .catch(() => {});
  }, []);

  return <>{children}</>;
}
