'use client';

import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Presentation } from 'lucide-react';

export default function OutputPage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">산출물 출력</h2>
        <p className="text-muted-foreground mt-1">
          완성된 제안서를 Word 문서와 PPT 장표로 다운로드합니다
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="text-center py-8">
            <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle>Word 문서</CardTitle>
            <CardDescription className="mb-4">
              전체 제안서 본문 (.docx)
            </CardDescription>
            <Button variant="outline" disabled>
              <Download className="mr-2 h-4 w-4" />
              다운로드 (준비 중)
            </Button>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="text-center py-8">
            <Presentation className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <CardTitle>PPT 장표</CardTitle>
            <CardDescription className="mb-4">
              발표용 요약 장표 (.pptx)
            </CardDescription>
            <Button variant="outline" disabled>
              <Download className="mr-2 h-4 w-4" />
              다운로드 (준비 중)
            </Button>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardHeader className="text-center py-8">
          <CardDescription>
            Word/PPT 생성 기능은 Week 7-8에서 구현됩니다.
            <br />
            현재는 RFP 분석 → 방향성 → 전략 → 목차 워크플로우까지 동작합니다.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
