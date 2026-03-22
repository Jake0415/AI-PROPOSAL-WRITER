'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Loader2, AlertCircle, Play, RotateCcw, Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import { StepResultViewer } from './step-result-viewer';
import { PromptEditDialog } from './prompt-edit-dialog';

interface StepData {
  id: string;
  projectId: string;
  stepNumber: number;
  slug: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result: Record<string, unknown> | null;
  errorMessage: string | null;
}

const STEP_LABELS = [
  { num: 1, label: '사업 개요 파악', slug: 'rfp-step1-overview' },
  { num: 2, label: '평가항목 추출', slug: 'rfp-step2-evaluation' },
  { num: 3, label: '요구사항 도출', slug: 'rfp-step3-requirements' },
  { num: 4, label: '추적성 매트릭스', slug: 'rfp-step4-traceability' },
  { num: 5, label: '자격요건/범위/제약', slug: 'rfp-step5-qualifications' },
  { num: 6, label: '배점 전략 분석', slug: 'rfp-step6-strategy' },
  { num: 7, label: '권장 목차 + 키워드', slug: 'rfp-step7-chapters' },
];

interface AnalysisStepRunnerProps {
  projectId: string;
  onComplete?: () => void;
}

export function AnalysisStepRunner({ projectId, onComplete }: AnalysisStepRunnerProps) {
  const [steps, setSteps] = useState<StepData[]>([]);
  const [runningStep, setRunningStep] = useState<number | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [promptEditSlug, setPromptEditSlug] = useState<string | null>(null);
  const [promptEditStep, setPromptEditStep] = useState<number>(0);

  const fetchSteps = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/rfp/analyze/steps`);
      const data = await res.json();
      if (data.success) setSteps(data.data);
    } catch { /* 무시 */ }
  }, [projectId]);

  useEffect(() => { fetchSteps(); }, [fetchSteps]);

  async function runStep(stepNumber: number) {
    setRunningStep(stepNumber);
    setError('');

    try {
      const res = await fetch(`/api/projects/${projectId}/rfp/analyze/step/${stepNumber}`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        await fetchSteps();
        setExpandedStep(stepNumber);

        // 마지막 단계 완료 시
        if (stepNumber === 7) {
          onComplete?.();
        }
      } else {
        setError(data.error?.message || '단계 실행에 실패했습니다');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setRunningStep(null);
    }
  }

  async function updateStepResult(stepNumber: number, result: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/projects/${projectId}/rfp/analyze/step/${stepNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
      });
      if (res.ok) await fetchSteps();
    } catch { /* 무시 */ }
  }

  function getStepStatus(stepNum: number): StepData['status'] {
    const step = steps.find(s => s.stepNumber === stepNum);
    if (runningStep === stepNum) return 'running';
    return step?.status ?? 'pending';
  }

  function getStepResult(stepNum: number): Record<string, unknown> | null {
    return steps.find(s => s.stepNumber === stepNum)?.result ?? null;
  }

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const allCompleted = completedCount === 7;

  return (
    <div className="space-y-3">
      {/* 진행률 헤더 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          분석 진행: {completedCount}/7 단계 완료
        </div>
        {!allCompleted && (
          <Button
            size="sm"
            onClick={() => {
              const nextStep = STEP_LABELS.find(s => getStepStatus(s.num) === 'pending' || getStepStatus(s.num) === 'failed');
              if (nextStep) runStep(nextStep.num);
            }}
            disabled={runningStep !== null}
          >
            {runningStep !== null ? (
              <><Loader2 className="mr-2 h-3 w-3 animate-spin" />실행 중...</>
            ) : (
              <><Play className="mr-2 h-3 w-3" />다음 단계 실행</>
            )}
          </Button>
        )}
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">
          {error}
          {error.includes('AI_KEY_ERROR') && (
            <a href="/settings" className="block mt-2 text-xs underline text-primary">
              설정 &gt; AI 키 관리에서 API 키를 확인하세요
            </a>
          )}
        </div>
      )}

      {/* 7단계 스테퍼 */}
      {STEP_LABELS.map(({ num, label }) => {
        const status = getStepStatus(num);
        const result = getStepResult(num);
        const isExpanded = expandedStep === num;
        const stepError = steps.find(s => s.stepNumber === num)?.errorMessage;

        return (
          <Card key={num} className={status === 'running' ? 'border-primary' : status === 'failed' ? 'border-destructive' : ''}>
            <CardHeader className="py-3 px-4">
              <div className="flex items-center gap-3">
                {/* 상태 아이콘 */}
                {status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />}
                {status === 'running' && <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />}
                {status === 'failed' && <AlertCircle className="h-5 w-5 text-destructive shrink-0" />}
                {status === 'pending' && <Circle className="h-5 w-5 text-muted-foreground/30 shrink-0" />}

                {/* 단계 정보 */}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-medium">
                    Step {num}: {label}
                  </CardTitle>
                  {stepError && (
                    <CardDescription className="text-destructive text-xs">{stepError}</CardDescription>
                  )}
                </div>

                {/* 상태 뱃지 */}
                <Badge variant={
                  status === 'completed' ? 'default' :
                  status === 'running' ? 'secondary' :
                  status === 'failed' ? 'destructive' : 'outline'
                } className="text-[10px] shrink-0">
                  {status === 'completed' ? '완료' : status === 'running' ? '실행 중' : status === 'failed' ? '실패' : '대기'}
                </Badge>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-1 shrink-0">
                  {(status === 'pending' || status === 'failed') && (
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => runStep(num)}
                      disabled={runningStep !== null}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  )}
                  {(status === 'completed' || status === 'failed') && (
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => {
                        const stepDef = STEP_LABELS.find(s => s.num === num);
                        if (stepDef) {
                          setPromptEditSlug(stepDef.slug);
                          setPromptEditStep(num);
                        }
                      }}
                      title="프롬프트 수정"
                    >
                      <Settings2 className="h-3 w-3" />
                    </Button>
                  )}
                  {status === 'completed' && (
                    <>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => runStep(num)}
                        disabled={runningStep !== null}
                        title="재실행"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => setExpandedStep(isExpanded ? null : num)}
                        title="결과 보기/편집"
                      >
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* 확장: Pretty Print / JSON 탭 뷰어 */}
              {isExpanded && result && (
                <div className="mt-3">
                  <StepResultViewer
                    result={result}
                    onSave={(updated) => updateStepResult(num, updated)}
                  />
                </div>
              )}
            </CardHeader>
          </Card>
        );
      })}

      {/* 프롬프트 편집 다이얼로그 */}
      {promptEditSlug && (
        <PromptEditDialog
          open={!!promptEditSlug}
          onOpenChange={(open) => { if (!open) setPromptEditSlug(null); }}
          slug={promptEditSlug}
          stepNumber={promptEditStep}
          onRerun={() => runStep(promptEditStep)}
        />
      )}
    </div>
  );
}
