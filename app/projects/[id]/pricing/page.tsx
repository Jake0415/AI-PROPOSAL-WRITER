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
  PriceProposalResult,
  LaborCostItem,
  EquipmentCostItem,
  ExpenseCostItem,
} from '@/lib/ai/types';

function formatWon(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

export default function PricingPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [price, setPrice] = useState<PriceProposalResult | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const sse = useSSE<PriceProposalResult>();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetch(`/api/projects/${projectId}/price`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setPrice(json.data);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingExisting(false));
    }
  }, [projectId]);

  useEffect(() => {
    if (sse.result) setPrice(sse.result);
  }, [sse.result]);

  function startGenerate() {
    sse.execute(`/api/projects/${projectId}/price/generate`);
  }

  if (isLoadingExisting) {
    return <div className="max-w-5xl mx-auto p-6 text-muted-foreground">로딩 중...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">가격 제안서</h2>
          <p className="text-muted-foreground mt-1">사업비 산출내역서 및 가격 경쟁력 분석</p>
        </div>
        <Button onClick={startGenerate} disabled={sse.isLoading}>
          {price ? '재산출' : '가격 산출'}
        </Button>
      </div>

      <ProgressTracker progress={sse.progress} step={sse.step} isLoading={sse.isLoading} />

      {sse.error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">오류</CardTitle>
            <CardDescription>{sse.error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {price && (
        <>
          {/* 총사업비 요약 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="text-center py-3">
                <CardDescription>직접비 소계</CardDescription>
                <CardTitle className="text-lg">{formatWon(price.summary?.directSubtotal ?? 0)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center py-3">
                <CardDescription>간접비 소계</CardDescription>
                <CardTitle className="text-lg">{formatWon(price.summary?.indirectSubtotal ?? 0)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center py-3">
                <CardDescription>부가세</CardDescription>
                <CardTitle className="text-lg">{formatWon(price.summary?.vat ?? 0)}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-primary">
              <CardHeader className="text-center py-3">
                <CardDescription>총사업비</CardDescription>
                <CardTitle className="text-xl text-primary">{formatWon(price.summary?.totalPrice ?? 0)}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* 가격 경쟁력 */}
          {price.competitiveness && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">가격 경쟁력 분석</CardTitle>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">예산 대비 비율:</span>
                    <span className="ml-2 font-bold">{price.competitiveness.budgetRatio}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">권장 범위:</span>
                    <span className="ml-2">{price.competitiveness.recommendedRange}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">전략:</span>
                    <span className="ml-2">{price.competitiveness.strategy}</span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* 상세 탭 */}
          <Tabs defaultValue="labor">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="labor">직접인건비</TabsTrigger>
              <TabsTrigger value="equipment">직접경비</TabsTrigger>
              <TabsTrigger value="expense">제경비</TabsTrigger>
              <TabsTrigger value="summary">총괄표</TabsTrigger>
            </TabsList>

            <TabsContent value="labor" className="mt-4">
              <div className="border rounded-lg overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3">역할</th>
                      <th className="text-center p-3">등급</th>
                      <th className="text-center p-3">인원</th>
                      <th className="text-center p-3">기간(M/M)</th>
                      <th className="text-right p-3">단가</th>
                      <th className="text-right p-3">금액</th>
                      <th className="text-left p-3">근거</th>
                    </tr>
                  </thead>
                  <tbody>
                    {price.laborCosts?.map((item: LaborCostItem, i: number) => (
                      <tr key={i} className="border-t">
                        <td className="p-3">{item.role}</td>
                        <td className="p-3 text-center"><Badge variant="outline">{item.grade}</Badge></td>
                        <td className="p-3 text-center">{item.headcount}</td>
                        <td className="p-3 text-center">{item.duration}</td>
                        <td className="p-3 text-right font-mono">{formatWon(item.unitPrice)}</td>
                        <td className="p-3 text-right font-mono font-bold">{formatWon(item.amount)}</td>
                        <td className="p-3 text-muted-foreground text-xs">{item.basis}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/30">
                    <tr className="border-t font-bold">
                      <td colSpan={5} className="p-3 text-right">직접인건비 합계</td>
                      <td className="p-3 text-right font-mono">{formatWon(price.summary?.directLabor ?? 0)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="equipment" className="mt-4">
              <div className="border rounded-lg overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3">구분</th>
                      <th className="text-left p-3">항목</th>
                      <th className="text-left p-3">규격</th>
                      <th className="text-center p-3">수량</th>
                      <th className="text-right p-3">단가</th>
                      <th className="text-right p-3">금액</th>
                      <th className="text-left p-3">근거</th>
                    </tr>
                  </thead>
                  <tbody>
                    {price.equipmentCosts?.map((item: EquipmentCostItem, i: number) => (
                      <tr key={i} className="border-t">
                        <td className="p-3"><Badge variant="outline">{item.category}</Badge></td>
                        <td className="p-3">{item.item}</td>
                        <td className="p-3 text-xs text-muted-foreground">{item.spec}</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right font-mono">{formatWon(item.unitPrice)}</td>
                        <td className="p-3 text-right font-mono font-bold">{formatWon(item.amount)}</td>
                        <td className="p-3 text-muted-foreground text-xs">{item.basis}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/30">
                    <tr className="border-t font-bold">
                      <td colSpan={5} className="p-3 text-right">직접경비 합계</td>
                      <td className="p-3 text-right font-mono">{formatWon(price.summary?.directExpense ?? 0)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="expense" className="mt-4">
              <div className="border rounded-lg overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3">항목</th>
                      <th className="text-left p-3">산출 근거</th>
                      <th className="text-right p-3">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {price.expenseCosts?.map((item: ExpenseCostItem, i: number) => (
                      <tr key={i} className="border-t">
                        <td className="p-3">{item.category}</td>
                        <td className="p-3 text-muted-foreground">{item.basis}</td>
                        <td className="p-3 text-right font-mono font-bold">{formatWon(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/30">
                    <tr className="border-t font-bold">
                      <td colSpan={2} className="p-3 text-right">제경비 합계</td>
                      <td className="p-3 text-right font-mono">{formatWon(price.summary?.miscExpense ?? 0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="summary" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">총사업비 요약</CardTitle>
                  <div className="mt-3">
                    <table className="w-full text-sm">
                      <tbody>
                        {[
                          ['직접인건비', price.summary?.directLabor],
                          ['직접경비', price.summary?.directExpense],
                          ['제경비', price.summary?.miscExpense],
                        ].map(([label, amount], i) => (
                          <tr key={i} className="border-b">
                            <td className="py-2 pl-4">{label as string}</td>
                            <td className="py-2 pr-4 text-right font-mono">{formatWon((amount ?? 0) as number)}</td>
                          </tr>
                        ))}
                        <tr className="border-b bg-muted/30 font-bold">
                          <td className="py-2 pl-4">직접비 소계</td>
                          <td className="py-2 pr-4 text-right font-mono">{formatWon(price.summary?.directSubtotal ?? 0)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 pl-4">일반관리비 ({price.indirectCosts?.generalAdminRate ?? 0}%)</td>
                          <td className="py-2 pr-4 text-right font-mono">{formatWon(price.summary?.generalAdmin ?? 0)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 pl-4">이윤 ({price.indirectCosts?.profitRate ?? 0}%)</td>
                          <td className="py-2 pr-4 text-right font-mono">{formatWon(price.summary?.profit ?? 0)}</td>
                        </tr>
                        <tr className="border-b bg-muted/30 font-bold">
                          <td className="py-2 pl-4">공급가액</td>
                          <td className="py-2 pr-4 text-right font-mono">{formatWon(price.summary?.supplyPrice ?? 0)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 pl-4">부가세 (10%)</td>
                          <td className="py-2 pr-4 text-right font-mono">{formatWon(price.summary?.vat ?? 0)}</td>
                        </tr>
                        <tr className="bg-primary/10 font-bold text-lg">
                          <td className="py-3 pl-4">총사업비</td>
                          <td className="py-3 pr-4 text-right font-mono text-primary">{formatWon(price.summary?.totalPrice ?? 0)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardHeader>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
