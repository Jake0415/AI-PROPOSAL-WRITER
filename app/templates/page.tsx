'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Presentation, FolderOpen } from 'lucide-react';

interface TemplateData {
  id: string;
  name: string;
  type: 'word' | 'ppt';
  isDefault: boolean;
  uploadedAt: string;
}

export default function TemplatesPage() {
  const [templatesList, setTemplatesList] = useState<TemplateData[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setTemplatesList(data.data);
      }
    } catch {
      // 템플릿 로드 실패
    }
  }

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">템플릿 관리</h1>
          <p className="mt-2 text-muted-foreground">
            제안서 생성에 사용할 Word/PPT 템플릿을 관리합니다.
          </p>
        </div>

        {templatesList.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>등록된 템플릿이 없습니다</CardTitle>
              <CardDescription>
                기본 템플릿으로 제안서가 생성됩니다.
                <br />
                커스텀 템플릿을 등록하면 회사 스타일에 맞춘 산출물을 생성할 수 있습니다.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templatesList.map((tpl) => (
              <Card key={tpl.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {tpl.type === 'word' ? (
                      <FileText className="h-8 w-8 text-blue-600" />
                    ) : (
                      <Presentation className="h-8 w-8 text-orange-600" />
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
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
