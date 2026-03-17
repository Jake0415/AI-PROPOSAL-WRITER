'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText } from 'lucide-react';

export default function SectionsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">내용 편집</h2>
          <p className="text-muted-foreground mt-1">
            각 섹션별 AI 생성 내용을 확인하고 편집합니다
          </p>
        </div>
        <Button onClick={() => router.push(`/projects/${projectId}/output`)}>
          다음: 산출물 출력
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Card className="border-dashed">
        <CardHeader className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle>섹션 내용 생성 기능</CardTitle>
          <CardDescription>
            목차별 상세 내용 AI 생성 및 편집 기능이 여기에 구현됩니다.
            <br />
            (Week 7-8에서 구현 예정)
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
