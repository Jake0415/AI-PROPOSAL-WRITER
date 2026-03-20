'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressTracker } from '@/components/project/progress-tracker';
import { useSSE } from '@/lib/hooks/use-sse';
import type { ProposalStrategyResult } from '@/lib/ai/types';
import { CoachingButton } from '@/components/guide/coaching-button';
import { AiChatPanel } from '@/components/project/ai-chat-panel';
import { ArrowRight, Target, MessageSquare, Sparkles } from 'lucide-react';

export default function StrategyPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [strategy, setStrategy] = useState<ProposalStrategyResult | null>(null);
  const sse = useSSE<ProposalStrategyResult>();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      sse.execute(`/api/projects/${projectId}/strategy/generate`);
    }
  }, [projectId, sse]);

  useEffect(() => {
    if (sse.result) {
      setStrategy(sse.result);
    }
  }, [sse.result]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">전략 수립</h2>
          <p className="text-muted-foreground mt-1">
            선택한 방향성 기반으로 경쟁 전략을 수립합니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          {strategy && (
            <>
              <AiChatPanel projectId={projectId} userId="" topic="strategy-coaching" />
              <CoachingButton projectId={projectId} stepKey="strategy" />
            </>
          )}
          {strategy && (
            <Button onClick={() => router.push(`/projects/${projectId}/outline`)}>
              다음: 목차 구성
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
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

      {strategy && (
        <div className="space-y-4">
          {/* 경쟁 전략 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">경쟁 전략</CardTitle>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                {strategy.competitiveStrategy}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* 차별화 포인트 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">차별화 포인트</CardTitle>
              </div>
            </CardHeader>
            <div className="px-6 pb-6 space-y-4">
              {strategy.differentiators?.map((diff, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-1">{diff.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{diff.description}</p>
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded px-3 py-2">
                    <span className="font-medium">근거:</span> {diff.evidence}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 핵심 메시지 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">핵심 메시지</CardTitle>
              </div>
            </CardHeader>
            <div className="px-6 pb-6 space-y-2">
              {strategy.keyMessages?.map((msg, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <Badge variant="outline" className="shrink-0 mt-0.5">{i + 1}</Badge>
                  <p>{msg}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
