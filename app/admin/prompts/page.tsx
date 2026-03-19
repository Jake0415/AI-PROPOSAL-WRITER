'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Database, Code } from 'lucide-react';

interface PromptItem {
  slug: string;
  name: string;
  description: string;
  category: string;
  maxTokens: number;
  version: number;
  isActive: boolean;
  source: 'db' | 'default';
}

const CATEGORY_LABELS: Record<string, string> = {
  analysis: '분석',
  generation: '생성',
  review: '검증',
  coaching: '코칭',
  price: '가격',
};

const CATEGORY_COLORS: Record<string, string> = {
  analysis: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  generation: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  review: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  coaching: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  price: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/admin/prompts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPrompts(data.data);
      })
      .catch(() => {});
  }, []);

  const filtered = filter === 'all' ? prompts : prompts.filter((p) => p.category === filter);
  const categories = ['all', ...new Set(prompts.map((p) => p.category))];

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">프롬프트 관리</h1>
          <p className="mt-2 text-muted-foreground">
            AI 제안서 생성에 사용되는 LLM 프롬프트를 관리합니다
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                filter === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-muted border-border'
              }`}
            >
              {cat === 'all' ? '전체' : CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <Link key={p.slug} href={`/admin/prompts/${p.slug}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-muted-foreground shrink-0" />
                      <CardTitle className="text-base">{p.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[p.category] ?? ''}`}>
                        {CATEGORY_LABELS[p.category] ?? p.category}
                      </Badge>
                      {p.source === 'db' ? (
                        <Badge variant="secondary" className="text-[10px]">
                          <Database className="mr-0.5 h-2.5 w-2.5" />
                          커스텀
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          <Code className="mr-0.5 h-2.5 w-2.5" />
                          기본값
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    {p.description}
                  </CardDescription>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span>v{p.version}</span>
                    <span>·</span>
                    <span>{p.maxTokens.toLocaleString()} tokens</span>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
