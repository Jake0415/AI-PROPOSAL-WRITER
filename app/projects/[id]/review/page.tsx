'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressTracker } from '@/components/project/progress-tracker';
import { useSSE } from '@/lib/hooks/use-sse';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  ReviewReportResult,
  EvalItemReviewResult,
  ReqReviewResult,
  ReviewImprovement,
  CoverageStatus,
} from '@/lib/ai/types';
import { cn } from '@/lib/utils';

function coverageBadge(status: CoverageStatus) {
  const styles: Record<CoverageStatus, string> = {
    COVERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    STRONG: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    PARTIAL: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    MISSING: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return <Badge className={cn('text-xs', styles[status])}>{status}</Badge>;
}

function gradeBadge(grade: string) {
  const styles: Record<string, string> = {
    A: 'bg-green-600 text-white',
    B: 'bg-blue-600 text-white',
    C: 'bg-yellow-600 text-white',
    D: 'bg-orange-600 text-white',
    F: 'bg-red-600 text-white',
  };
  return <Badge className={cn('text-lg px-3 py-1', styles[grade] ?? styles.F)}>{grade}</Badge>;
}

function priorityBadge(priority: string) {
  const styles: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    major: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    minor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };
  const labels: Record<string, string> = {
    critical: '긴급',
    major: '중요',
    minor: '선택',
  };
  return <Badge className={cn('text-xs', styles[priority])}>{labels[priority] ?? priority}</Badge>;
}

export default function ReviewPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [report, setReport] = useState<ReviewReportResult | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const sse = useSSE<ReviewReportResult>();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetch(`/api/projects/${projectId}/review`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setReport(json.data);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingExisting(false));
    }
  }, [projectId]);

  useEffect(() => {
    if (sse.result) {
      setReport(sse.result);
    }
  }, [sse.result]);

  function startReview() {
    sse.execute(`/api/projects/${projectId}/review/generate`);
  }

  if (isLoadingExisting) {
    return <div className="max-w-5xl mx-auto p-6 text-muted-foreground">로딩 중...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">제안서 검증 리포트</h2>
          <p className="text-muted-foreground mt-1">
            평가항목 기준 충족도 및 예상 점수를 확인합니다
          </p>
        </div>
        <Button onClick={startReview} disabled={sse.isLoading}>
          {report ? '재검증' : '검증 시작'}
        </Button>
      </div>

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

      {report && (
        <>
          {/* 종합 요약 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="col-span-2 md:col-span-1">
              <CardHeader className="text-center">
                <CardDescription>종합 등급</CardDescription>
                <div className="mt-2">{gradeBadge(report.grade)}</div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <CardDescription>예상 점수</CardDescription>
                <CardTitle className="text-xl">{report.overallScore}/{report.totalPossible}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <CardDescription>평가항목 충족률</CardDescription>
                <CardTitle className="text-xl">{report.evalCoverage}%</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <CardDescription>요구사항 충족률</CardDescription>
                <CardTitle className="text-xl">{report.reqCoverage}%</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <CardDescription>형식 준수율</CardDescription>
                <CardTitle className="text-xl">{report.formatCompliance}%</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* 요약 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">검증 요약</CardTitle>
              <CardDescription className="whitespace-pre-wrap">{report.summary}</CardDescription>
            </CardHeader>
          </Card>

          {/* 탭 상세 */}
          <Tabs defaultValue="eval">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="eval">평가항목 검토</TabsTrigger>
              <TabsTrigger value="req">요구사항 충족</TabsTrigger>
              <TabsTrigger value="improve">개선 사항</TabsTrigger>
            </TabsList>

            {/* 평가항목별 상세 */}
            <TabsContent value="eval" className="space-y-3 mt-4">
              {report.evalResults?.map((item: EvalItemReviewResult, i: number) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.evalId}</Badge>
                        <CardTitle className="text-sm">{item.item}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {coverageBadge(item.coverage)}
                        <span className="text-sm font-mono font-bold">
                          {item.expectedScore}/{item.maxScore}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="font-medium text-green-600 dark:text-green-400 mb-1">강점</p>
                        <p className="text-muted-foreground">{item.strengths || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-orange-600 dark:text-orange-400 mb-1">약점</p>
                        <p className="text-muted-foreground">{item.weaknesses || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-blue-600 dark:text-blue-400 mb-1">개선방안</p>
                        <p className="text-muted-foreground">{item.improvement || '-'}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>

            {/* 요구사항 충족 */}
            <TabsContent value="req" className="mt-4">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3">ID</th>
                      <th className="text-left p-3">요구사항</th>
                      <th className="text-center p-3">필수</th>
                      <th className="text-center p-3">카테고리</th>
                      <th className="text-center p-3">충족도</th>
                      <th className="text-left p-3">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.reqResults?.map((req: ReqReviewResult, i: number) => (
                      <tr key={i} className={cn(
                        'border-t',
                        req.coverage === 'MISSING' && req.mandatory && 'bg-red-50 dark:bg-red-950/20',
                      )}>
                        <td className="p-3 font-mono text-xs">{req.reqId}</td>
                        <td className="p-3">{req.title}</td>
                        <td className="p-3 text-center">
                          {req.mandatory && <Badge variant="destructive" className="text-xs">필수</Badge>}
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="outline" className="text-xs">{req.category}</Badge>
                        </td>
                        <td className="p-3 text-center">{coverageBadge(req.coverage)}</td>
                        <td className="p-3 text-muted-foreground text-xs">{req.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* 개선 사항 */}
            <TabsContent value="improve" className="space-y-3 mt-4">
              {report.improvements?.map((item: ReviewImprovement, i: number) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {priorityBadge(item.priority)}
                        <CardTitle className="text-sm">{item.item}</CardTitle>
                      </div>
                      <Badge variant="secondary">+{item.expectedImpact}점</Badge>
                    </div>
                    <div className="mt-2 text-sm space-y-1">
                      <p><span className="text-muted-foreground">현재:</span> {item.currentState}</p>
                      <p><span className="text-muted-foreground">개선:</span> {item.action}</p>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
