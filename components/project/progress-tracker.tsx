interface ProgressTrackerProps {
  progress: number;
  step: string;
  isLoading: boolean;
}

export function ProgressTracker({ progress, step, isLoading }: ProgressTrackerProps) {
  if (!isLoading && progress === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{step}</span>
        <span className="font-medium">{progress}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
