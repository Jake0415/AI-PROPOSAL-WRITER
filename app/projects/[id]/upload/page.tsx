'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Loader2 } from 'lucide-react';

export default function UploadPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFile(selectedFile)) {
      setFile(selectedFile);
    }
  }, []);

  function isValidFile(f: File): boolean {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    return validTypes.includes(f.type);
  }

  async function handleUpload() {
    if (!file) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/projects/${projectId}/rfp/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        router.push(`/projects/${projectId}/analysis`);
      }
    } catch {
      // 에러 처리
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">RFP 업로드</h2>
        <p className="text-muted-foreground mt-1">
          분석할 RFP(제안요청서) 파일을 업로드하세요
        </p>
      </div>

      {/* 드래그앤드롭 영역 */}
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
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </CardHeader>
      </Card>

      {/* 선택된 파일 정보 */}
      {file && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
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
                '업로드 및 분석 시작'
              )}
            </Button>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
