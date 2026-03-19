'use client';

import { useEffect, useState } from 'react';

export function Footer() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAuthenticated(true);
      })
      .catch(() => {});
  }, []);

  if (!authenticated) return null;

  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-10 md:h-16 md:flex-row md:py-0 px-4">
        <p className="text-center text-sm text-muted-foreground md:text-left">
          AIPROWRITER — AI 제안서 자동 생성 시스템
        </p>
        <p className="text-sm text-muted-foreground">
          © 2026 All rights reserved.
        </p>
      </div>
    </footer>
  );
}
