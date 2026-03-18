import { BookOpen, Shield, ListChecks } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getGuideSectionsByCategory } from '@/lib/guide/guide-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '제안서 작성 가이드 | AIPROWRITER',
  description:
    '공공입찰 제안서와 일반 제안서를 효과적으로 작성하는 방법을 안내합니다.',
};

export default function GuidePage() {
  const basicSections = getGuideSectionsByCategory('basic');
  const publicBidSections = getGuideSectionsByCategory('public-bid');
  const stepDetailSections = getGuideSectionsByCategory('step-detail');

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          제안서 작성 가이드
        </h1>
        <p className="mt-2 text-muted-foreground">
          좋은 제안서를 작성하기 위한 핵심 원칙과 실전 노하우를 정리했습니다.
          공공입찰부터 일반 제안까지, 단계별로 참고하세요.
        </p>
      </div>

      {/* 탭 */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="basic" className="gap-2">
            <BookOpen className="h-4 w-4" />
            기본 원칙
          </TabsTrigger>
          <TabsTrigger value="public-bid" className="gap-2">
            <Shield className="h-4 w-4" />
            공공입찰 특화
          </TabsTrigger>
          <TabsTrigger value="step-detail" className="gap-2">
            <ListChecks className="h-4 w-4" />
            단계별 가이드
          </TabsTrigger>
        </TabsList>

        {/* 기본 원칙 탭 */}
        <TabsContent value="basic" className="space-y-6">
          <p className="text-sm text-muted-foreground">
            제안서 유형에 관계없이 적용되는 보편적인 작성 원칙입니다.
          </p>
          {basicSections.map((section) => (
            <div key={section.id}>
              <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
              <Accordion type="multiple" className="space-y-2">
                {section.items.map((item) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-sm font-medium hover:no-underline">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.content}
                      </p>
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-foreground">
                          실전 팁
                        </span>
                        <ul className="list-disc list-inside space-y-1">
                          {item.tips.map((tip, i) => (
                            <li
                              key={i}
                              className="text-xs text-muted-foreground"
                            >
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {item.examples && item.examples.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-xs font-semibold text-foreground">
                            예시
                          </span>
                          <div className="space-y-1">
                            {item.examples.map((example, i) => (
                              <p
                                key={i}
                                className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1"
                              >
                                {example}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Separator className="mt-6" />
            </div>
          ))}
        </TabsContent>

        {/* 공공입찰 특화 탭 */}
        <TabsContent value="public-bid" className="space-y-6">
          <p className="text-sm text-muted-foreground">
            한국 공공입찰 제안서에 특화된 전략과 작성 노하우입니다.
          </p>
          {publicBidSections.map((section) => (
            <div key={section.id}>
              <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
              <Accordion type="multiple" className="space-y-2">
                {section.items.map((item) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-sm font-medium hover:no-underline">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.content}
                      </p>
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-foreground">
                          실전 팁
                        </span>
                        <ul className="list-disc list-inside space-y-1">
                          {item.tips.map((tip, i) => (
                            <li
                              key={i}
                              className="text-xs text-muted-foreground"
                            >
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Separator className="mt-6" />
            </div>
          ))}
        </TabsContent>

        {/* 단계별 가이드 탭 */}
        <TabsContent value="step-detail" className="space-y-6">
          <p className="text-sm text-muted-foreground">
            AIPROWRITER의 7단계 워크플로우에 맞춘 상세 가이드입니다.
          </p>
          <Accordion type="multiple" className="space-y-2">
            {stepDetailSections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="text-sm font-medium hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {section.order}단계
                    </Badge>
                    {section.title.replace(/^\d단계:\s*/, '')}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {section.items.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.content}
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {item.tips.map((tip, i) => (
                          <li
                            key={i}
                            className="text-xs text-muted-foreground"
                          >
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  );
}
