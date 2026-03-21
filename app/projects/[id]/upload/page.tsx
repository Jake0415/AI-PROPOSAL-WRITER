'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Loader2, X, Trash2, AlertTriangle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface ExistingFile {
  fileName: string;
  fileSize: number;
  vectorStatus: 'none' | 'processing' | 'completed' | 'failed';
}

export default function UploadPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'uploading' | 'processing' | ''>('');
  const [existingFile, setExistingFile] = useState<ExistingFile | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadExisting() {
      try {
        const res = await fetch(`/api/projects/${projectId}/rfp/upload`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.fileName) {
            setExistingFile(data.data);
          }
        }
      } catch { /* ignore */ }
      setLoadingExisting(false);
    }
    loadExisting();
  }, [projectId]);

  const canDelete = existingFile?.vectorStatus === 'none';
  const isVectorStarted = existingFile && existingFile.vectorStatus !== 'none';

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!existingFile) setIsDragging(true);
  }, [existingFile]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (existingFile) return;
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile)) {
      setFile(droppedFile);
    } else if (droppedFile) {
      toast.error('PDF 또는 DOCX 파일만 업로드할 수 있습니다');
    }
  }, [existingFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFile(selectedFile)) {
      setFile(selectedFile);
    }
  }, []);

  function handleCancelFile() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function isValidFile(f: File): boolean {
    return [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ].includes(f.type);
  }

  async function handleDeleteFile() {
    if (!canDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/rfp/upload`, { method: 'DELETE' });
      if (res.ok) {
        setExistingFile(null);
        setFile(null);
        toast.success('파일이 삭제되었습니다');
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error?.message || '삭제에 실패했습니다');
      }
    } catch {
      toast.error('삭제 중 오류가 발생했습니다');
    }
    setIsDeleting(false);
  }

  function handleUpload() {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('uploading');

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.upload.onload = () => setUploadStatus('processing');

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        toast.success('RFP 파일이 업로드되었습니다');
        setIsUploading(false);
        setUploadStatus('');
        router.push(`/projects/${projectId}/vectorize`);
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          toast.error(data.error?.message || '업로드에 실패했습니다');
        } catch { toast.error('업로드에 실패했습니다'); }
        setIsUploading(false);
        setUploadStatus('');
      }
    };

    xhr.onerror = () => {
      toast.error('네트워크 오류가 발생했습니다');
      setIsUploading(false);
      setUploadStatus('');
    };

    xhr.open('POST', `/api/projects/${projectId}/rfp/upload`);
    xhr.send(formData);
  }

  if (loadingExisting) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">RFP 업로드</h2>
        <p className="text-muted-foreground mt-1">
          분석할 RFP(제안요청서) 파일을 업로드하세요
        </p>
      </div>

      {/* 기존 파일이 있는 경우 — 파일 정보 카드 */}
      {existingFile && !isUploading && (
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">{existingFile.fileName}</CardTitle>
                <CardDescription>{(existingFile.fileSize / 1024 / 1024).toFixed(2)} MB</CardDescription>
              </div>
              <Badge variant={isVectorStarted ? 'default' : 'outline'} className={isVectorStarted ? 'bg-green-600' : ''}>
                {existingFile.vectorStatus === 'completed' ? '벡터 생성 완료'
                  : existingFile.vectorStatus === 'processing' ? '벡터 생성 중'
                  : existingFile.vectorStatus === 'failed' ? '벡터 생성 실패'
                  : '업로드됨'}
              </Badge>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteFile}
                  disabled={isDeleting}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="파일 삭제"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              )}
            </div>

            {/* 벡터 시작됨 → 삭제 불가 안내 */}
            {isVectorStarted && (
              <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  벡터 데이터 생성이 진행된 파일은 삭제할 수 없습니다. 새 프로젝트를 생성하세요.
                </p>
              </div>
            )}
          </CardHeader>
        </Card>
      )}

      {/* 다음 단계 버튼 (파일 존재 시) */}
      {existingFile && !isUploading && (
        <div className="flex justify-end">
          <Button className="gap-2" onClick={() => router.push(`/projects/${projectId}/vectorize`)}>
            다음 단계: 벡터 데이터 생성
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 파일 없음 → 드래그&드롭 */}
      {!existingFile && !isUploading && (
        <Card
          className={`border-2 border-dashed transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardHeader className="text-center py-16">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>파일을 드래그하거나 클릭하여 업로드</CardTitle>
            <CardDescription>PDF, DOCX 형식 지원 (최대 50MB)</CardDescription>
            <div className="mt-4">
              <label htmlFor="file-upload">
                <Button variant="outline" asChild>
                  <span>파일 선택</span>
                </Button>
              </label>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </CardHeader>
        </Card>
      )}

      {/* 선택된 파일 (업로드 전) */}
      {file && !existingFile && (
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">{file.name}</CardTitle>
                <CardDescription>{(file.size / 1024 / 1024).toFixed(2)} MB</CardDescription>
              </div>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />업로드 중...</>
                ) : '파일 업로드'}
              </Button>
              {!isUploading && (
                <Button variant="ghost" size="icon" onClick={handleCancelFile}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {isUploading && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {uploadStatus === 'processing' ? (
                    <><Loader2 className="h-4 w-4 animate-spin text-primary" />서버에서 텍스트 추출 및 저장 중...</>
                  ) : (
                    <><Upload className="h-4 w-4 text-primary" />업로드 중... {uploadProgress}%</>
                  )}
                </div>
                <Progress value={uploadStatus === 'processing' ? 100 : uploadProgress} className="h-2" />
              </div>
            )}
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
