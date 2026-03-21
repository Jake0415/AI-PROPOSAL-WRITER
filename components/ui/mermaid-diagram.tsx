'use client';

import { useEffect, useRef, useState } from 'react';

/** SVG 문자열에서 script 태그와 인라인 이벤트 핸들러를 제거 */
function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
}

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export function MermaidDiagram({ chart, className = '' }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!chart.trim()) return;

    let cancelled = false;

    async function renderChart() {
      try {
        // mermaid를 동적 import (클라이언트에서만 로드)
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'strict',
        });

        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);

        if (!cancelled) {
          setSvg(renderedSvg);
          setError('');
        }
      } catch {
        if (!cancelled) {
          setError('다이어그램 렌더링 실패');
          setSvg('');
        }
      }
    }

    renderChart();

    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error) {
    return (
      <div className={`rounded border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-3 text-xs text-amber-700 dark:text-amber-300 ${className}`}>
        {error}
        <pre className="mt-2 text-[10px] opacity-60 overflow-x-auto">{chart}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className={`rounded border border-border/40 bg-muted/30 p-4 text-center text-xs text-muted-foreground ${className}`}>
        다이어그램 로딩 중...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`rounded border border-border/40 bg-white dark:bg-muted/30 p-4 overflow-x-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeSvg(svg) }}
    />
  );
}
