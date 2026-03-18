'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="min-h-[calc(100vh-3.5rem-3rem)] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <CardTitle>오류가 발생했습니다</CardTitle>
          <CardDescription className="mt-2">
            {error.message || '예기치 않은 오류가 발생했습니다.'}
          </CardDescription>
          <Button onClick={reset} className="mt-4">
            다시 시도
          </Button>
        </CardHeader>
      </Card>
    </div>
  );
}
