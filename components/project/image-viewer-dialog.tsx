'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageMeta {
  id: string;
  pageNumber: number;
  imageType: string;
  width: number;
  height: number;
  description: string;
  keywords: string[];
  filterStatus: string;
  filterReason: string;
}

interface ImageViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function ImageViewerDialog({ open, onOpenChange, projectId }: ImageViewerDialogProps) {
  const [images, setImages] = useState<ImageMeta[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/projects/${projectId}/rfp/images`)
      .then(res => res.json())
      .then(data => { if (data.success) setImages(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, projectId]);

  const keepImages = images.filter(img => img.filterStatus === 'keep');
  const skipImages = images.filter(img => img.filterStatus !== 'keep');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            이미지 메타데이터 ({images.length}개, 유효 {keepImages.length}개)
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : images.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">이미지가 없습니다</p>
          ) : (
            <>
              {/* Keep 이미지 */}
              {keepImages.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">유효 이미지 ({keepImages.length}개)</h3>
                  {keepImages.map(img => (
                    <ImageCard key={img.id} image={img} projectId={projectId} />
                  ))}
                </div>
              )}

              {/* Skip 이미지 */}
              {skipImages.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">필터 제거됨 ({skipImages.length}개)</h3>
                  {skipImages.map(img => (
                    <ImageCard key={img.id} image={img} projectId={projectId} dimmed />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ImageCard({ image, projectId, dimmed }: { image: ImageMeta; projectId: string; dimmed?: boolean }) {
  return (
    <div className={`flex gap-4 rounded-md border p-3 ${dimmed ? 'opacity-50' : ''}`}>
      {/* 썸네일 */}
      <div className="shrink-0 w-32 h-24 rounded bg-muted overflow-hidden flex items-center justify-center">
        <img
          src={`/api/projects/${projectId}/rfp/images/${image.id}/file`}
          alt={image.description || `Page ${image.pageNumber}`}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
        />
      </div>

      {/* 메타정보 */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px]">Page {image.pageNumber}</Badge>
          <Badge variant="secondary" className="text-[10px]">{image.imageType}</Badge>
          <Badge variant="secondary" className="text-[10px]">{image.width}x{image.height}</Badge>
          <Badge
            variant={image.filterStatus === 'keep' ? 'default' : 'destructive'}
            className="text-[10px]"
          >
            {image.filterStatus}
          </Badge>
        </div>

        {image.description && (
          <p className="text-xs text-muted-foreground">{image.description}</p>
        )}

        {image.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {image.keywords.map((kw, i) => (
              <Badge key={i} variant="outline" className="text-[9px]">{kw}</Badge>
            ))}
          </div>
        )}

        {image.filterReason && (
          <p className="text-[10px] text-muted-foreground italic">{image.filterReason}</p>
        )}
      </div>
    </div>
  );
}
