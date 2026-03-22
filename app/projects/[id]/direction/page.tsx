'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressTracker } from '@/components/project/progress-tracker';
import { useSSE } from '@/lib/hooks/use-sse';
import type { DirectionCandidate } from '@/lib/ai/types';
import { CoachingButton } from '@/components/guide/coaching-button';
import { AiChatPanel } from '@/components/project/ai-chat-panel';
import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DirectionPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [candidates, setCandidates] = useState<DirectionCandidate[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const sse = useSSE<DirectionCandidate[]>();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetch(`/api/projects/${projectId}/direction`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data?.candidates?.length > 0) {
            setCandidates(json.data.candidates);
            if (json.data.selectedIndex != null && json.data.selectedIndex >= 0) {
              setSelectedIndex(json.data.selectedIndex);
            }
          } else {
            sse.execute(`/api/projects/${projectId}/direction/generate`);
          }
        })
        .catch(() => {
          sse.execute(`/api/projects/${projectId}/direction/generate`);
        })
        .finally(() => setIsLoadingExisting(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (sse.result) {
      setCandidates(sse.result);
    }
  }, [sse.result]);

  async function confirmSelection() {
    if (selectedIndex < 0) return;
    setIsConfirming(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/direction/select`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedIndex }),
      });
      if (res.ok) {
        router.push(`/projects/${projectId}/strategy`);
      }
    } catch {
      // 에러 처리
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">방향성 설정</h2>
          <p className="text-muted-foreground mt-1">
            AI가 제시한 제안 방향 중 하나를 선택하세요
          </p>
        </div>
        <div className="flex items-center gap-2">
          {candidates.length > 0 && (
            <>
              <AiChatPanel projectId={projectId} />
              <CoachingButton projectId={projectId} stepKey="direction" />
            </>
          )}
          {selectedIndex >= 0 && (
            <Button onClick={confirmSelection} disabled={isConfirming}>
              확정 및 다음 단계
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

      {candidates.length > 0 && (
        <div className="grid gap-4">
          {candidates.map((candidate, i) => (
            <Card
              key={i}
              className={cn(
                'cursor-pointer transition-all',
                selectedIndex === i
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'hover:border-primary/50',
              )}
              onClick={() => setSelectedIndex(i)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0',
                        selectedIndex === i
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30',
                      )}
                    >
                      {selectedIndex === i && <Check className="h-3 w-3" />}
                    </div>
                    <CardTitle className="text-lg">{candidate.title}</CardTitle>
                  </div>
                  <Badge variant="secondary">적합도 {candidate.fitScore}%</Badge>
                </div>
                <CardDescription className="ml-9 mt-2">
                  {candidate.description}
                </CardDescription>
                <div className="ml-9 mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-green-600 dark:text-green-400 mb-1">강점</p>
                    <ul className="space-y-1 text-muted-foreground">
                      {candidate.strengths?.map((s, j) => (
                        <li key={j}>+ {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-orange-600 dark:text-orange-400 mb-1">약점</p>
                    <ul className="space-y-1 text-muted-foreground">
                      {candidate.weaknesses?.map((w, j) => (
                        <li key={j}>- {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
