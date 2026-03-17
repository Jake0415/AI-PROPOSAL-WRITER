'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Upload,
  Search,
  Compass,
  Target,
  List,
  FileText,
  Download,
} from 'lucide-react';

interface StepNavigationProps {
  projectId: string;
  currentStatus: string;
}

const STEPS = [
  { key: 'upload', label: 'RFP 업로드', icon: Upload, path: 'upload' },
  { key: 'analysis', label: '분석 결과', icon: Search, path: 'analysis' },
  { key: 'direction', label: '방향성 설정', icon: Compass, path: 'direction' },
  { key: 'strategy', label: '전략 수립', icon: Target, path: 'strategy' },
  { key: 'outline', label: '목차 구성', icon: List, path: 'outline' },
  { key: 'sections', label: '내용 편집', icon: FileText, path: 'sections' },
  { key: 'output', label: '산출물 출력', icon: Download, path: 'output' },
];

const STATUS_ORDER = [
  'uploaded',
  'analyzing',
  'direction_set',
  'strategy_set',
  'outline_ready',
  'generating',
  'completed',
];

export function StepNavigation({ projectId, currentStatus }: StepNavigationProps) {
  const pathname = usePathname();
  const statusIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <nav className="w-56 shrink-0 border-r border-border/40 p-4 space-y-1">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        진행 단계
      </div>
      {STEPS.map((step, i) => {
        const isActive = pathname.includes(`/${step.path}`);
        const isAccessible = i <= statusIndex + 1;
        const Icon = step.icon;

        return (
          <Link
            key={step.key}
            href={isAccessible ? `/projects/${projectId}/${step.path}` : '#'}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-primary/10 text-primary font-medium'
                : isAccessible
                  ? 'text-foreground hover:bg-muted'
                  : 'text-muted-foreground/50 pointer-events-none',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {step.label}
          </Link>
        );
      })}
    </nav>
  );
}
