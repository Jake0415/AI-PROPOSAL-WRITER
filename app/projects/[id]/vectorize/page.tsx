'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowRight } from 'lucide-react';
import { VectorRegistrationPanel } from '@/components/project/vector-registration-panel';

interface RfpFileInfo {
  fileName: string;
  fileSize: number;
  vectorStatus: string;
}

export default function VectorizePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [rfpFile, setRfpFile] = useState<RfpFileInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFileInfo() {
      try {
        const res = await fetch(`/api/projects/${projectId}/rfp/upload`);
        if (res.ok) {
          const data = await res.json();
          setRfpFile(data.data ?? data);
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    loadFileInfo();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!rfpFile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">벡터 데이터 생성</h1>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            RFP 파일을 먼저 업로드하세요.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">벡터 데이터 생성</h1>

      {/* 파일 정보 카드 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            업로드된 RFP 파일
          </CardTitle>
          <CardDescription className="flex items-center gap-3">
            <span>{rfpFile.fileName}</span>
            <Badge variant="outline">{(rfpFile.fileSize / 1024 / 1024).toFixed(1)} MB</Badge>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 벡터 등록 패널 */}
      <VectorRegistrationPanel
        projectId={projectId}
        rfpFile={rfpFile}
        onStatusChange={(status) => {
          setRfpFile(prev => prev ? { ...prev, vectorStatus: status } : null);
          if (status === 'completed') {
            // 서버 컴포넌트(사이드바) 상태 갱신
            router.refresh();
          }
        }}
      />

      {/* 완료 시 다음 단계 버튼 */}
      {rfpFile.vectorStatus === 'completed' && (
        <div className="flex justify-end">
          <Button
            size="lg"
            className="gap-2"
            onClick={() => router.push(`/projects/${projectId}/analysis`)}
          >
            다음 단계: RFP 분석
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
