import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileQuestion } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem-3rem)] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle>페이지를 찾을 수 없습니다</CardTitle>
          <CardDescription className="mt-2">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
          </CardDescription>
          <Button asChild className="mt-4">
            <Link href="/">대시보드로 돌아가기</Link>
          </Button>
        </CardHeader>
      </Card>
    </div>
  );
}
