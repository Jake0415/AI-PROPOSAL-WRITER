'use client';

import { Loader2 } from 'lucide-react';

interface DataLoadingSpinnerProps {
  message?: string;
}

export function DataLoadingSpinner({ message = '데이터를 불러오는 중...' }: DataLoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
