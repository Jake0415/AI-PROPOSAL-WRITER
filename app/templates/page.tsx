'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Presentation, FolderOpen, Upload, Trash2, Loader2 } from 'lucide-react';

interface TemplateData {
  id: string;
  name: string;
  type: 'word' | 'ppt';
  isDefault: boolean;
  uploadedAt: string;
}

export default function TemplatesPage() {
  const [templatesList, setTemplatesList] = useState<TemplateData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchTemplates(); }, []);

  async function fetchTemplates() {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setTemplatesList(data.data);
      }
    } catch { /* 무시 */ }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/templates/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setMessage('템플릿이 등록되었습니다');
        fetchTemplates();
      } else {
        setMessage(data.error?.message || '업로드에 실패했습니다');
      }
    } catch {
      setMessage('네트워크 오류가 발생했습니다');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('이 템플릿을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchTemplates();
      } else {
        setMessage(data.error?.message || '삭제에 실패했습니다');
      }
    } catch {
      setMessage('네트워크 오류가 발생했습니다');
    }
  }

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">템플릿 관리</h1>
            <p className="mt-2 text-muted-foreground">
              제안서 생성에 사용할 Word/PPT 템플릿을 관리합니다
            </p>
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".docx,.pptx"
              onChange={handleUpload}
              className="hidden"
            />
            <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {uploading ? '업로드 중...' : '템플릿 업로드'}
            </Button>
          </div>
        </div>

        {message && (
          <p className={`text-sm ${message.includes('실패') || message.includes('오류') ? 'text-destructive' : 'text-green-600'}`}>
            {message}
          </p>
        )}

        {templatesList.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>등록된 템플릿이 없습니다</CardTitle>
              <CardDescription>
                기본 템플릿으로 제안서가 생성됩니다.
                <br />
                Word(.docx) 또는 PPT(.pptx) 파일을 업로드하세요.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templatesList.map((tpl) => (
              <Card key={tpl.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {tpl.type === 'word' ? (
                        <FileText className="h-8 w-8 text-blue-600 shrink-0" />
                      ) : (
                        <Presentation className="h-8 w-8 text-orange-600 shrink-0" />
                      )}
                      <div>
                        <CardTitle className="text-base">{tpl.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">
                            {tpl.type.toUpperCase()}
                          </Badge>
                          {tpl.isDefault && (
                            <Badge className="text-[10px]">기본</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {!tpl.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(tpl.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
