'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { CoachingButton } from '@/components/guide/coaching-button';
import { AiChatPanel } from '@/components/project/ai-chat-panel';
import { AnalysisStepRunner } from '@/components/project/analysis-step-runner';
import type { RfpAnalysisResult } from '@/lib/ai/types';
import { REQUIREMENT_CATEGORY_LABELS } from '@/lib/ai/types';
import type { RequirementCategory } from '@/lib/ai/types';
import { ArrowRight, FileText } from 'lucide-react';

const PRIORITY_STYLES = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

interface RfpFileInfo {
  fileName: string;
  fileSize: number;
  gptFileId: string | null;
  vectorStatus: 'none' | 'processing' | 'completed' | 'failed';
}

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [analysis, setAnalysis] = useState<RfpAnalysisResult | null>(null);
  const [rfpFile, setRfpFile] = useState<RfpFileInfo | null>(null);

  const fetchExisting = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/rfp/analysis`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setAnalysis(data.data);
      }
    } catch { /* 무시 */ }
  }, [projectId]);

  // RFP 파일 정보 별도 로드
  useEffect(() => {
    async function loadFileInfo() {
      try {
        const res = await fetch(`/api/projects/${projectId}/rfp/upload`, { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          if (data.success) setRfpFile(data.data);
        }
      } catch { /* 무시 */ }
    }
    loadFileInfo();
    fetchExisting();
  }, [projectId, fetchExisting]);

  // 요구사항 카테고리별 그룹핑
  const reqByCategory = analysis?.requirements?.reduce((acc, req) => {
    const cat = req.category as RequirementCategory;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(req);
    return acc;
  }, {} as Record<string, typeof analysis.requirements>) ?? {};

  const mandatoryCount = analysis?.requirements?.filter(r => r.mandatory).length ?? 0;
  const totalReqCount = analysis?.requirements?.length ?? 0;
  const mappedMandatory = new Set(analysis?.traceabilityMatrix?.map(m => m.requirementId) ?? []);
  const unmappedMandatory = analysis?.requirements?.filter(r => r.mandatory && !mappedMandatory.has(r.id)) ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">수주 최적화 RFP 분석</h2>
          <p className="text-muted-foreground mt-1">
            평가항목·요구사항·추적성을 기반으로 전략적 분석을 수행합니다
          </p>
        </div>
        {analysis && (
          <div className="flex items-center gap-2">
            <AiChatPanel projectId={projectId} userId="anonymous" topic="rfp-analysis" />
            <CoachingButton projectId={projectId} stepKey="analysis" />
            <Button onClick={() => router.push(`/projects/${projectId}/direction`)}>
              다음: 방향성 설정
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* 파일 상태 카드 */}
      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <div>
                <CardTitle className="text-sm">
                  {rfpFile?.fileName ?? 'RFP 파일 없음'}
                </CardTitle>
                {rfpFile && (
                  <CardDescription className="text-xs">
                    {(rfpFile.fileSize / 1024 / 1024).toFixed(2)} MB
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {rfpFile?.vectorStatus === 'completed' && (
                <Badge variant="default" className="text-xs bg-green-600">벡터 등록 완료</Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 7단계 스테퍼 */}
      {!analysis && (
        <AnalysisStepRunner
          projectId={projectId}
          onComplete={fetchExisting}
        />
      )}

      {/* 분석 결과 탭 */}
      {analysis && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">사업 개요</TabsTrigger>
            <TabsTrigger value="evaluation">평가항목</TabsTrigger>
            <TabsTrigger value="requirements">요구사항</TabsTrigger>
            <TabsTrigger value="traceability">추적성</TabsTrigger>
            <TabsTrigger value="qualifications">자격요건</TabsTrigger>
            <TabsTrigger value="strategy">권장 목차</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader><CardTitle className="text-lg">사업 개요</CardTitle></CardHeader>
              <div className="px-6 pb-6 space-y-2 text-sm">
                <div><span className="font-medium">사업명:</span> {analysis.overview?.projectName}</div>
                <div><span className="font-medium">발주기관:</span> {analysis.overview?.client}</div>
                {analysis.overview?.supervisingOrg && analysis.overview.supervisingOrg !== '미기재' && (
                  <div><span className="font-medium">감독기관:</span> {analysis.overview.supervisingOrg}</div>
                )}
                <div><span className="font-medium">예산:</span> {analysis.overview?.budget}</div>
                <div><span className="font-medium">기간:</span> {analysis.overview?.duration}</div>
                {analysis.overview?.contractType && analysis.overview.contractType !== '미기재' && (
                  <div><span className="font-medium">계약유형:</span> {analysis.overview.contractType}</div>
                )}
                {analysis.overview?.bidMethod && analysis.overview.bidMethod !== '미기재' && (
                  <div><span className="font-medium">입찰방식:</span> {analysis.overview.bidMethod}</div>
                )}
                {analysis.overview?.purpose && (
                  <div><span className="font-medium">목적:</span> {analysis.overview.purpose}</div>
                )}
                {analysis.overview?.background && analysis.overview.background !== '미기재' && (
                  <>
                    <Separator className="my-3" />
                    <div><span className="font-medium">사업 배경:</span> {analysis.overview.background}</div>
                  </>
                )}
                <Separator className="my-3" />
                <p className="text-muted-foreground">{analysis.overview?.summary}</p>
                {analysis.overview?.deliveryLocation && analysis.overview.deliveryLocation !== '미기재' && (
                  <div className="pt-2"><span className="font-medium">납품장소:</span> {analysis.overview.deliveryLocation}</div>
                )}
                {(analysis.overview?.relatedSystems ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="font-medium mr-1">연계시스템:</span>
                    {(analysis.overview?.relatedSystems ?? []).map((sys, i) => <Badge key={i} variant="outline" className="text-xs">{sys}</Badge>)}
                  </div>
                )}
                {(analysis.overview?.specialConditions ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="font-medium mr-1">특수조건:</span>
                    {(analysis.overview?.specialConditions ?? []).map((cond, i) => <Badge key={i} variant="secondary" className="text-xs">{cond}</Badge>)}
                  </div>
                )}
              </div>
            </Card>
            {analysis.keywords?.length > 0 && (
              <Card className="mt-4">
                <CardHeader><CardTitle className="text-lg">핵심 키워드</CardTitle></CardHeader>
                <div className="px-6 pb-6 flex flex-wrap gap-2">
                  {(analysis.keywords ?? []).map((kw, i) => <Badge key={i} variant="outline">{kw}</Badge>)}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="evaluation">
            <div className="space-y-4">
              {analysis.strategyPoints?.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-lg">배점 전략</CardTitle></CardHeader>
                  <div className="px-6 pb-6 space-y-3">
                    {(analysis.strategyPoints ?? []).map((sp, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={PRIORITY_STYLES[sp.priority]}>
                            {sp.priority === 'high' ? '🔴 고배점' : sp.priority === 'medium' ? '🟡 중배점' : '🟢 저배점'}
                          </Badge>
                          <span className="text-sm font-medium">{sp.totalScore}점 ({sp.recommendedRatio}% 분량)</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{sp.strategy}</p>
                        <div className="flex gap-1 mt-2">
                          {(sp.evalIds ?? []).map(id => <Badge key={id} variant="outline" className="text-[10px]">{id}</Badge>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">평가항목 ({analysis.evaluationItems?.length ?? 0}개)</CardTitle>
                </CardHeader>
                <div className="px-6 pb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-2 w-20">ID</th><th className="py-2">분류</th><th className="py-2">항목</th>
                        <th className="py-2 text-right w-16">배점</th><th className="py-2 text-right w-16">가중치</th><th className="py-2 w-16">우선순위</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(analysis.evaluationItems ?? []).map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-2 font-mono text-xs">{item.id}</td><td className="py-2">{item.category}</td><td className="py-2">{item.item}</td>
                          <td className="py-2 text-right font-medium">{item.score}점</td><td className="py-2 text-right">{item.weight}%</td>
                          <td className="py-2"><Badge className={`text-[10px] ${PRIORITY_STYLES[item.priority]}`}>{item.priority === 'high' ? '고' : item.priority === 'medium' ? '중' : '저'}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requirements">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">요구사항 정의서 (총 {totalReqCount}개)</CardTitle>
                <CardDescription>mandatory: {mandatoryCount}개 | optional: {totalReqCount - mandatoryCount}개</CardDescription>
              </CardHeader>
              <div className="px-6 pb-6 space-y-6">
                {Object.entries(reqByCategory).map(([cat, reqs]) => (
                  <div key={cat}>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Badge variant="outline">{cat}</Badge>
                      {REQUIREMENT_CATEGORY_LABELS[cat as RequirementCategory] ?? cat}
                      <span className="text-muted-foreground font-normal">({reqs.length}개)</span>
                    </h3>
                    <div className="space-y-1">
                      {reqs.map((req) => (
                        <div key={req.id} className="flex items-start gap-3 py-2 border-b last:border-0 text-sm">
                          <span className="font-mono text-xs text-muted-foreground w-24 shrink-0">{req.id}</span>
                          <div className="flex-1">
                            <span className="font-medium">{req.title ?? req.description?.slice(0, 50)}</span>
                            {req.description && req.title && <p className="text-xs text-muted-foreground mt-0.5">{req.description}</p>}
                          </div>
                          <Badge variant={req.mandatory ? 'default' : 'secondary'} className="text-[10px] shrink-0">{req.mandatory ? '필수' : '선택'}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="traceability">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">추적성 매트릭스</CardTitle>
                  <CardDescription>
                    mandatory 커버리지: {mandatoryCount > 0
                      ? `${mandatoryCount - unmappedMandatory.length}/${mandatoryCount} (${Math.round(((mandatoryCount - unmappedMandatory.length) / mandatoryCount) * 100)}%)`
                      : '데이터 없음'}
                  </CardDescription>
                </CardHeader>
                <div className="px-6 pb-6">
                  {analysis.traceabilityMatrix?.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead><tr className="border-b text-left"><th className="py-2">요구사항 ID</th><th className="py-2">평가항목 ID</th><th className="py-2">권장 챕터</th></tr></thead>
                      <tbody>
                        {(analysis.traceabilityMatrix ?? []).map((m, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-2 font-mono text-xs">{m.requirementId}</td>
                            <td className="py-2 font-mono text-xs">{m.evaluationItemId}</td>
                            <td className="py-2">{m.proposalChapter ?? '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p className="text-sm text-muted-foreground">추적성 매트릭스가 생성되지 않았습니다.</p>}
                </div>
              </Card>
              {unmappedMandatory.length > 0 && (
                <Card className="border-amber-200 dark:border-amber-800">
                  <CardHeader><CardTitle className="text-sm text-amber-700 dark:text-amber-300">⚠️ 매핑 안 된 필수 요구사항 ({unmappedMandatory.length}개)</CardTitle></CardHeader>
                  <div className="px-6 pb-4 space-y-1">
                    {unmappedMandatory.map((req) => <div key={req.id} className="text-xs text-amber-600 dark:text-amber-400">{req.id} — {req.title ?? req.description?.slice(0, 60)}</div>)}
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="qualifications">
            <Card>
              <CardHeader><CardTitle className="text-lg">참가 자격요건</CardTitle></CardHeader>
              <div className="px-6 pb-6">
                {analysis.qualifications?.length > 0 ? (
                  <div className="space-y-2">
                    {(analysis.qualifications ?? []).map((q, i) => (
                      <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0 text-sm">
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {q.type === 'eligibility' ? '자격' : q.type === 'deadline' ? '납기' : q.type === 'warranty' ? '보증' : q.type === 'legal' ? '법규' : '하도급'}
                        </Badge>
                        <span className="flex-1">{q.description}</span>
                        <Badge variant={q.mandatory ? 'default' : 'secondary'} className="text-[10px] shrink-0">{q.mandatory ? '필수' : '선택'}</Badge>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">자격요건 정보가 없습니다.</p>}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="strategy">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI 권장 제안서 목차</CardTitle>
                <CardDescription>배점 비례로 분량을 배분한 권장 구성입니다</CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                {analysis.recommendedChapters?.length > 0 ? (
                  <div className="space-y-3">
                    {(analysis.recommendedChapters ?? []).map((ch, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{ch.chapter}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">{ch.evalId}</Badge>
                            <Badge className="text-[10px]">{ch.score}점</Badge>
                            <span className="text-xs text-muted-foreground">약 {ch.recommendedPages}p</span>
                          </div>
                        </div>
                        {ch.relatedRequirements?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {ch.relatedRequirements.map(id => <Badge key={id} variant="secondary" className="text-[9px]">{id}</Badge>)}
                          </div>
                        )}
                      </div>
                    ))}
                    <Separator />
                    <p className="text-xs text-muted-foreground text-right">
                      총 약 {(analysis.recommendedChapters ?? []).reduce((sum, ch) => sum + ch.recommendedPages, 0)}페이지 (A4 기준)
                    </p>
                  </div>
                ) : <p className="text-sm text-muted-foreground">권장 목차가 생성되지 않았습니다.</p>}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
