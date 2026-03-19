import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import type { SSEStepInfo } from '@/lib/hooks/use-sse';

interface AnalysisProgressStepperProps {
  steps: SSEStepInfo[];
  progress: number;
  isLoading: boolean;
}

export function AnalysisProgressStepper({
  steps,
  progress,
  isLoading,
}: AnalysisProgressStepperProps) {
  if (!isLoading && progress === 0) return null;
  if (steps.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-300 ${
              step.status === 'active'
                ? 'bg-primary/10 text-primary font-medium'
                : step.status === 'complete'
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/50'
            }`}
          >
            <span className="flex-shrink-0">
              {step.status === 'complete' && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              {step.status === 'active' && (
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              )}
              {step.status === 'pending' && (
                <Circle className="h-4 w-4 text-muted-foreground/30" />
              )}
            </span>
            <span>
              {idx + 1}. {step.label}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{steps.find((s) => s.status === 'active')?.label ?? '준비 중...'}</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
