'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search } from 'lucide-react';

interface Chunk {
  id: string;
  text: string;
  pageNumber: number;
  chunkIndex: number;
}

interface ChunkViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function ChunkViewerDialog({ open, onOpenChange, projectId }: ChunkViewerDialogProps) {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/projects/${projectId}/rfp/chunks`)
      .then(res => res.json())
      .then(data => { if (data.success) setChunks(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, projectId]);

  const filtered = search
    ? chunks.filter(c => c.text.toLowerCase().includes(search.toLowerCase()))
    : chunks;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>텍스트 청크 ({chunks.length}개)</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="청크 내용 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              {search ? '검색 결과가 없습니다' : '청크 데이터가 없습니다'}
            </p>
          ) : (
            filtered.map(chunk => {
              const isExpanded = expanded.has(chunk.chunkIndex);
              const preview = chunk.text.substring(0, 200);
              const hasMore = chunk.text.length > 200;

              return (
                <div
                  key={chunk.chunkIndex}
                  className="rounded-md border p-3 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    const next = new Set(expanded);
                    if (isExpanded) next.delete(chunk.chunkIndex);
                    else next.add(chunk.chunkIndex);
                    setExpanded(next);
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px]">#{chunk.chunkIndex + 1}</Badge>
                    <Badge variant="secondary" className="text-[10px]">Page {chunk.pageNumber}</Badge>
                    <span className="text-xs text-muted-foreground">{chunk.text.length}자</span>
                  </div>
                  <p className="text-xs whitespace-pre-wrap text-muted-foreground">
                    {isExpanded ? chunk.text : preview}
                    {hasMore && !isExpanded && '...'}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {search && (
          <p className="text-xs text-muted-foreground text-right">
            {filtered.length} / {chunks.length}개 매칭
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
