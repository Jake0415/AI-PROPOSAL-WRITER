'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSSE } from '@/lib/hooks/use-sse';
import { CoachingDialog } from './coaching-dialog';
import type { CoachingResult } from '@/lib/guide/types';

interface CoachingButtonProps {
  projectId: string;
  stepKey: string;
  disabled?: boolean;
}

export function CoachingButton({
  projectId,
  stepKey,
  disabled = false,
}: CoachingButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const sse = useSSE<CoachingResult>();

  function handleClick() {
    setDialogOpen(true);
    sse.execute(`/api/projects/${projectId}/coaching`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepKey }),
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={disabled || sse.isLoading}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        {sse.isLoading ? '분석 중...' : 'AI 코칭'}
      </Button>
      <CoachingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        result={sse.result}
        isLoading={sse.isLoading}
        progress={sse.progress}
        step={sse.step}
        error={sse.error}
      />
    </>
  );
}
