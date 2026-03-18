'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Loader2, Presentation, CheckCircle } from 'lucide-react';

type DocType = 'word' | 'ppt';

export default function OutputPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [generating, setGenerating] = useState<DocType | null>(null);
  const [generated, setGenerated] = useState<Set<DocType>>(new Set());
  const [error, setError] = useState('');

  async function handleDownload(type: DocType) {
    setGenerating(type);
    setError('');

    try {
      const res = await fetch(`/api/projects/${projectId}/output/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message ?? '문서 생성에 실패했습니다');
        setGenerating(null);
        return;
      }

      // Blob으로 변환 후 다운로드
      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition');
      let fileName = type === 'word' ? '제안서.docx' : '제안서.pptx';

      // Content-Disposition에서 파일명 추출
      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*=UTF-8''(.+)/);
        if (match) {
          fileName = decodeURIComponent(match[1]);
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setGenerated((prev) => new Set(prev).add(type));
    } catch {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setGenerating(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">산출물 출력</h2>
        <p className="text-muted-foreground mt-1">
          완성된 제안서를 Word 문서와 PPT 장표로 다운로드합니다
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive text-sm">오류</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Word 카드 */}
        <Card>
          <CardHeader className="text-center py-8">
            <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle className="flex items-center justify-center gap-2">
              Word 문서
              {generated.has('word') && (
                <Badge variant="default" className="text-[10px]">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  생성 완료
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mb-4">
              전체 제안서 본문 (.docx)
              <br />
              <span className="text-xs">
                표지, 목차, Executive Summary, 전체 섹션 포함
              </span>
            </CardDescription>
            <Button
              variant="outline"
              onClick={() => handleDownload('word')}
              disabled={generating !== null}
            >
              {generating === 'word' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {generating === 'word' ? '생성 중...' : 'Word 다운로드'}
            </Button>
          </CardHeader>
        </Card>

        {/* PPT 카드 */}
        <Card>
          <CardHeader className="text-center py-8">
            <Presentation className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <CardTitle className="flex items-center justify-center gap-2">
              PPT 장표
              {generated.has('ppt') && (
                <Badge variant="default" className="text-[10px]">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  생성 완료
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mb-4">
              발표용 요약 장표 (.pptx)
              <br />
              <span className="text-xs">
                표지, 목차, 요약, 섹션별 슬라이드
              </span>
            </CardDescription>
            <Button
              variant="outline"
              onClick={() => handleDownload('ppt')}
              disabled={generating !== null}
            >
              {generating === 'ppt' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {generating === 'ppt' ? '생성 중...' : 'PPT 다운로드'}
            </Button>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-muted">
        <CardHeader className="py-4">
          <CardDescription className="text-xs text-center">
            산출물은 이전 단계(분석 → 전략 → 목차 → 섹션)의 데이터를 기반으로 생성됩니다.
            <br />
            내용 수정이 필요하면 이전 단계에서 편집 후 다시 다운로드하세요.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
