'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Bot, Users, Palette, Database, FileSearch, Info, Lock } from 'lucide-react';

interface AuthUser {
  role: string;
}

const SETTINGS_CARDS = [
  {
    id: 'admin-dashboard',
    title: '운용현황(관리)',
    description: '프로젝트 현황 및 통계',
    icon: BarChart3,
    href: '/admin',
    adminOnly: true,
  },
  {
    id: 'ai-settings',
    title: 'AI LLM 설정',
    description: 'AI 프로바이더, 모델, API 키 관리',
    icon: Bot,
    href: '/settings/ai',
    adminOnly: false,
  },
  {
    id: 'user-management',
    title: '사용자관리',
    description: '사용자 계정 및 역할 관리',
    icon: Users,
    href: '/admin/users',
    adminOnly: true,
  },
  {
    id: 'branding',
    title: '브랜딩',
    description: '앱 이름, 로고, 테마 색상 설정',
    icon: Palette,
    href: '/admin/customization',
    adminOnly: true,
  },
  {
    id: 'data-management',
    title: '데이터 관리',
    description: '데이터 백업 및 복구',
    icon: Database,
    href: '/admin/data',
    adminOnly: true,
  },
  {
    id: 'audit-logs',
    title: '감사로그',
    description: '시스템 활동 추적 및 감사',
    icon: FileSearch,
    href: '/admin/audit',
    adminOnly: true,
  },
  {
    id: 'version',
    title: '버전 정보',
    description: '앱 버전 및 시스템 정보',
    icon: Info,
    href: '/settings/version',
    adminOnly: false,
  },
];

export default function SettingsPage() {
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

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">설정</h1>
          <p className="mt-2 text-muted-foreground">
            시스템 운영 및 관리 설정을 구성합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SETTINGS_CARDS.map((card) => {
            const Icon = card.icon;
            const isLocked = card.adminOnly && !isAdmin;

            if (isLocked) return null;

            return (
              <Card
                key={card.id}
                className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                onClick={() => router.push(card.href)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    {card.adminOnly && (
                      <Badge variant="secondary" className="text-[10px]">
                        <Lock className="h-2.5 w-2.5 mr-0.5" />
                        관리자
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base">{card.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {card.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
