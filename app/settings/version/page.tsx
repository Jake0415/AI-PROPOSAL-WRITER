'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';

interface VersionInfo {
  appVersion: string;
  nodeVersion: string;
  nextVersion: string;
  platform: string;
}

export default function VersionPage() {
  const [info, setInfo] = useState<VersionInfo | null>(null);

  useEffect(() => {
    fetch('/api/settings/version')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setInfo(data.data);
      })
      .catch(() => {
        setInfo({
          appVersion: '1.0.0',
          nodeVersion: '-',
          nextVersion: '-',
          platform: '-',
        });
      });
  }, []);

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-3.5 w-3.5" />
            설정으로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">버전 정보</h1>
          <p className="mt-2 text-muted-foreground">
            앱 버전 및 시스템 정보를 확인합니다.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>AIPROWRITER</CardTitle>
                <CardDescription>AI 기반 제안서 자동 생성 솔루션</CardDescription>
              </div>
            </div>

            <div className="space-y-3">
              <InfoRow label="앱 버전" value={info?.appVersion ?? '-'} badge />
              <InfoRow label="Node.js" value={info?.nodeVersion ?? '-'} />
              <InfoRow label="Next.js" value={info?.nextVersion ?? '-'} />
              <InfoRow label="플랫폼" value={info?.platform ?? '-'} />
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value, badge }: { label: string; value: string; badge?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      {badge ? (
        <Badge variant="outline">{value}</Badge>
      ) : (
        <span className="text-sm font-mono">{value}</span>
      )}
    </div>
  );
}
