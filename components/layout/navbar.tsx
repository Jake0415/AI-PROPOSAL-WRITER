'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { LogOut, User } from 'lucide-react';

interface AuthUser {
  id: string;
  loginId: string;
  name: string;
  role: string;
}

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.data);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              AIPROWRITER
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm lg:gap-6">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              대시보드
            </Link>
            <Link
              href="/templates"
              className="transition-colors hover:text-foreground/80 text-muted-foreground"
            >
              템플릿
            </Link>
            <Link
              href="/guide"
              className="transition-colors hover:text-foreground/80 text-muted-foreground"
            >
              가이드
            </Link>
            <Link
              href="/settings"
              className="transition-colors hover:text-foreground/80 text-muted-foreground"
            >
              설정
            </Link>
            {user && (user.role === 'super_admin' || user.role === 'admin') && (
              <>
                <Link
                  href="/admin"
                  className="transition-colors hover:text-foreground/80 text-muted-foreground"
                >
                  관리
                </Link>
                <Link
                  href="/admin/users"
                  className="transition-colors hover:text-foreground/80 text-muted-foreground"
                >
                  사용자
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Badge variant="secondary" className="mr-2">
              v1.0.0
            </Badge>
          </div>
          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {user.name || user.loginId}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="로그아웃"
                  className="h-8 w-8"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">로그인</Link>
              </Button>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
