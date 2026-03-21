'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Loader2, RotateCcw, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { useSSE } from '@/lib/hooks/use-sse';
import type { VectorRegistrationResult } from '@/lib/vector/rag.service';

interface RfpFileInfo {
  fileName: string;
  fileSize: number;
  vectorStatus: string;
}

interface VectorRegistrationPanelProps {
  projectId: string;
  rfpFile: RfpFileInfo | null;
  onStatusChange?: (status: string) => void;
}

export function VectorRegistrationPanel({ projectId, rfpFile, onStatusChange }: VectorRegistrationPanelProps) {
  const sse = useSSE<VectorRegistrationResult>();
  const [savedResult, setSavedResult] = useState<VectorRegistrationResult | null>(null);

  // localStorage에서 이전 결과 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(`vector-result-${projectId}`);
    if (saved) {
      try { setSavedResult(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, [projectId]);

  // SSE 완료 시 결과 저장
  useEffect(() => {
    if (sse.result) {
      setSavedResult(sse.result);
      localStorage.setItem(`vector-result-${projectId}`, JSON.stringify(sse.result));
      onStatusChange?.('completed');
    }
  }, [sse.result, projectId, onStatusChange]);

  useEffect(() => {
    if (sse.error) {
      onStatusChange?.('failed');
    }
  }, [sse.error, onStatusChange]);

  if (!rfpFile) return null;

  const isCompleted = rfpFile.vectorStatus === 'completed';
  const isFailed = rfpFile.vectorStatus === 'failed';
  const isProcessing = sse.isLoading;
  const displayResult = sse.result ?? savedResult;

  async function startRegistration() {
    onStatusChange?.('processing');
    await sse.execute(`/api/projects/${projectId}/rfp/vector-register`);
  }

  async function reRegister() {
    try {
      await fetch(`/api/projects/${projectId}/rfp/vector-register`, { method: 'DELETE' });
      onStatusChange?.('none');
      setSavedResult(null);
      localStorage.removeItem(`vector-result-${projectId}`);
      // 약간의 딜레이 후 재시작
      setTimeout(() => startRegistration(), 300);
    } catch {
      onStatusChange?.('failed');
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">벡터 데이터 생성</CardTitle>
          </div>
          {isCompleted && !isProcessing && (
            <Badge variant="default" className="bg-green-600">등록 완료</Badge>
          )}
          {isProcessing && (
            <Badge variant="secondary">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              진행중
            </Badge>
          )}
          {isFailed && !isProcessing && (
            <Badge variant="destructive">실패</Badge>
          )}
          {!isCompleted && !isFailed && !isProcessing && (
            <Badge variant="outline">미등록</Badge>
          )}
        </div>
        <CardDescription>
          RFP 문서를 벡터 데이터로 변환하여 AI 분석 정확도를 높입니다
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 진행 중: 스테퍼 + 프로그레스 */}
        {isProcessing && (
          <div className="space-y-3">
            {/* 미니 스테퍼 */}
            {sse.steps.length > 0 && (
              <div className="space-y-1">
                {sse.steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {s.status === 'complete' ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    ) : s.status === 'active' ? (
                      <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                    )}
                    <span className={s.status === 'active' ? 'text-primary font-medium' : s.status === 'complete' ? 'text-muted-foreground' : 'text-muted-foreground/50'}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 현재 단계 상세 */}
            <div className="text-sm text-muted-foreground">{sse.step}</div>

            {/* 프로그레스 바 */}
            <div className="space-y-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${sse.progress}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground text-right">{sse.progress}%</div>
            </div>
          </div>
        )}

        {/* 완료: 결과 요약 */}
        {isCompleted && !isProcessing && displayResult && (
          <div className="grid grid-cols-2 gap-3">
            <ResultItem label="텍스트 청크" value={`${displayResult.chunkCount.toLocaleString()}개`} />
            <ResultItem label="추출 이미지" value={`${(displayResult as unknown as { extractedImageCount?: number }).extractedImageCount ?? 0}개`} />
            <ResultItem label="이미지 벡터" value={`${(displayResult as unknown as { imageChunkCount?: number }).imageChunkCount ?? 0}개`} />
            <ResultItem label="임베딩 모델" value={displayResult.embeddingModel} />
            <ResultItem label="청크 사이즈" value={`${displayResult.chunkSizeTokens.toLocaleString()} 토큰`} />
            <ResultItem label="소요 시간" value={`${(displayResult.elapsedMs / 1000).toFixed(1)}초`} />
          </div>
        )}

        {/* 실패: 에러 메시지 */}
        {isFailed && !isProcessing && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <XCircle className="h-4 w-4 shrink-0" />
            <span>{sse.error ?? '벡터 생성에 실패했습니다'}</span>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-2">
          {!isCompleted && !isFailed && !isProcessing && (
            <Button onClick={startRegistration} className="gap-2">
              <Zap className="h-4 w-4" />
              벡터 생성
            </Button>
          )}
          {isFailed && !isProcessing && (
            <Button variant="outline" onClick={reRegister} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              재실행
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/50 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
