'use client';

import { useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'uploading' | 'processing' | ''>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile)) {
      setFile(droppedFile);
    } else if (droppedFile) {
      toast.error('PDF 또는 DOCX 파일만 업로드할 수 있습니다');
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFile(selectedFile)) {
      setFile(selectedFile);
    }
  }, []);

  function handleCancelFile() {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('파일 선택이 취소되었습니다');
  }

  function isValidFile(f: File): boolean {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    return validTypes.includes(f.type);
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

    xhr.upload.onload = () => {
      setUploadStatus('processing');
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        toast.success('RFP 파일이 업로드되었습니다');
        setIsUploading(false);
        setUploadStatus('');
        router.push(`/projects/${projectId}/analysis`);
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          toast.error(data.error?.message || '업로드에 실패했습니다');
        } catch {
          toast.error('업로드에 실패했습니다');
        }
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">RFP 업로드</h2>
        <p className="text-muted-foreground mt-1">
          분석할 RFP(제안요청서) 파일을 업로드하세요
        </p>
      </div>

      {/* 드래그앤드롭 영역 (업로드 중 숨김) */}
      {!isUploading && (
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

      {/* 선택된 파일 정보 + 인라인 Progress */}
      {file && (
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">{file.name}</CardTitle>
                <CardDescription>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </CardDescription>
              </div>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  '파일 업로드'
                )}
              </Button>
              {!isUploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelFile}
                  aria-label="파일 선택 취소"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* 인라인 Progress */}
            {isUploading && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {uploadStatus === 'processing' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      서버에서 텍스트 추출 및 저장 중...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 text-primary" />
                      업로드 중... {uploadProgress}%
                    </>
                  )}
                </div>
                <Progress
                  value={uploadStatus === 'processing' ? 100 : uploadProgress}
                  className="h-2"
                />
              </div>
            )}
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
