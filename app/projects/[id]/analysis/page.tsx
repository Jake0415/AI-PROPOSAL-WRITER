'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressTracker } from '@/components/project/progress-tracker';
import { useSSE } from '@/lib/hooks/use-sse';
import type { RfpAnalysisResult } from '@/lib/ai/types';
import { CoachingButton } from '@/components/guide/coaching-button';
import { Loader2, ArrowRight } from 'lucide-react';

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [analysis, setAnalysis] = useState<RfpAnalysisResult | null>(null);
  const sse = useSSE<RfpAnalysisResult>();

  const fetchExisting = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/rfp/analysis`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAnalysis(data.data);
        }
      }
    } catch {
      // 분석 결과 없음
    }
  }, [projectId]);

  useEffect(() => {
    fetchExisting();
  }, [fetchExisting]);

  useEffect(() => {
    if (sse.result) {
      setAnalysis(sse.result);
    }
  }, [sse.result]);

  function startAnalysis() {
    sse.execute(`/api/projects/${projectId}/rfp/analyze`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">RFP 분석 결과</h2>
          <p className="text-muted-foreground mt-1">
            AI가 RFP를 분석하여 요구사항과 평가기준을 추출합니다
          </p>
        </div>
        {!analysis && !sse.isLoading && (
          <Button onClick={startAnalysis}>
            <Loader2 className="mr-2 h-4 w-4" />
            분석 시작
          </Button>
        )}
        <div className="flex items-center gap-2">
          {analysis && (
            <CoachingButton projectId={projectId} stepKey="analysis" />
          )}
          {analysis && (
            <Button onClick={() => router.push(`/projects/${projectId}/direction`)}>
              다음: 방향성 설정
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 진행률 */}
      <ProgressTracker
        progress={sse.progress}
        step={sse.step}
        isLoading={sse.isLoading}
      />

      {sse.error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">오류</CardTitle>
            <CardDescription>{sse.error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* 분석 결과 표시 */}
      {analysis && (
        <div className="space-y-4">
          {/* 사업 개요 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">사업 개요</CardTitle>
            </CardHeader>
            <div className="px-6 pb-6 space-y-2 text-sm">
              <div><span className="font-medium">사업명:</span> {analysis.overview?.projectName}</div>
              <div><span className="font-medium">발주기관:</span> {analysis.overview?.client}</div>
              <div><span className="font-medium">예산:</span> {analysis.overview?.budget}</div>
              <div><span className="font-medium">기간:</span> {analysis.overview?.duration}</div>
              <div className="pt-2 text-muted-foreground">{analysis.overview?.summary}</div>
            </div>
          </Card>

          {/* 요구사항 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                요구사항 ({analysis.requirements?.length ?? 0}건)
              </CardTitle>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="space-y-2">
                {analysis.requirements?.map((req, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm py-2 border-b last:border-0">
                    <Badge variant={req.priority === 'high' ? 'default' : 'secondary'} className="shrink-0 mt-0.5">
                      {req.priority === 'high' ? '높음' : req.priority === 'medium' ? '중간' : '낮음'}
                    </Badge>
                    <div>
                      <span className="text-xs text-muted-foreground">[{req.category}]</span>
                      <p>{req.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* 평가 기준 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">평가 기준</CardTitle>
            </CardHeader>
            <div className="px-6 pb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">분류</th>
                    <th className="text-left py-2">항목</th>
                    <th className="text-right py-2">배점</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.evaluationCriteria?.map((ec, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2">{ec.category}</td>
                      <td className="py-2">{ec.item}</td>
                      <td className="text-right py-2 font-medium">{ec.score}점</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 키워드 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">핵심 키워드</CardTitle>
            </CardHeader>
            <div className="px-6 pb-6 flex flex-wrap gap-2">
              {analysis.keywords?.map((kw, i) => (
                <Badge key={i} variant="outline">{kw}</Badge>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
