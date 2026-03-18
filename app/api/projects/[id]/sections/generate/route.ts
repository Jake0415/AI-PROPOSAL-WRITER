import { NextRequest } from 'next/server';
import { generateText } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import { projectRepository } from '@/lib/repositories/project.repository';
import {
  SECTION_SYSTEM_PROMPT,
  buildSectionPrompt,
} from '@/lib/ai/prompts/section-generation';
import type { OutlineSection } from '@/lib/ai/types';

// leaf 섹션 추출 (children이 없는 노드)
interface FlatSection {
  title: string;
  path: string;
}

function flattenLeafSections(
  sections: OutlineSection[],
  parentPath = '',
): FlatSection[] {
  const result: FlatSection[] = [];
  for (const section of sections) {
    const path = parentPath
      ? `${parentPath}.${section.order}`
      : `${section.order}`;
    if (!section.children || section.children.length === 0) {
      result.push({ title: section.title, path });
    } else {
      result.push(...flattenLeafSections(section.children, path));
    }
  }
  return result;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(type: string, data: Record<string, unknown>) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`),
        );
      }

      try {
        send('progress', { step: '데이터 로딩', progress: 5 });

        // 필요 데이터 로드
        const [analysis, strategy, outline] = await Promise.all([
          rfpRepository.getAnalysisByProjectId(projectId),
          proposalRepository.getStrategy(projectId),
          proposalRepository.getOutline(projectId),
        ]);

        if (!analysis || !strategy || !outline) {
          send('error', {
            error: {
              code: 'MISSING_DATA',
              message: '분석, 전략, 목차 데이터가 필요합니다. 이전 단계를 먼저 완료해주세요.',
            },
          });
          controller.close();
          return;
        }

        // 데이터 준비
        const analysisJson = JSON.stringify({
          overview: JSON.parse(analysis.overview),
          requirements: JSON.parse(analysis.requirements),
          evaluationCriteria: JSON.parse(analysis.evaluationCriteria),
        });
        const strategyJson = JSON.stringify({
          competitiveStrategy: strategy.competitiveStrategy,
          differentiators: JSON.parse(strategy.differentiators),
          keyMessages: JSON.parse(strategy.keyMessages),
        });
        const outlineSections: OutlineSection[] = JSON.parse(outline.sections);
        const outlineJson = JSON.stringify(outlineSections);

        // leaf 섹션 추출
        const leafSections = flattenLeafSections(outlineSections);
        const totalSections = leafSections.length;

        if (totalSections === 0) {
          send('error', {
            error: { code: 'NO_SECTIONS', message: '생성할 섹션이 없습니다.' },
          });
          controller.close();
          return;
        }

        send('progress', {
          step: `${totalSections}개 섹션 생성 시작`,
          progress: 10,
        });

        // 프로젝트 상태 업데이트
        await projectRepository.updateStatus(projectId, 'generating');

        const generatedSections: Array<{
          id: string;
          sectionPath: string;
          title: string;
          content: string;
          diagrams: string;
          status: string;
        }> = [];

        // 각 섹션 순차 생성
        for (let i = 0; i < totalSections; i++) {
          const leaf = leafSections[i];
          const progress = Math.round(10 + (i / totalSections) * 80);

          send('progress', {
            step: `[${i + 1}/${totalSections}] ${leaf.title} 생성 중`,
            progress,
            currentSection: leaf.title,
          });

          // AI 생성
          const result = await generateText({
            systemPrompt: SECTION_SYSTEM_PROMPT,
            userPrompt: buildSectionPrompt(
              leaf.title,
              leaf.path,
              analysisJson,
              strategyJson,
              outlineJson,
            ),
            maxTokens: 4096,
          });

          // JSON 파싱
          let sectionData: { content: string; diagrams: string[] };
          try {
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            sectionData = jsonMatch
              ? JSON.parse(jsonMatch[0])
              : JSON.parse(result);
          } catch {
            sectionData = {
              content: result.slice(0, 3000),
              diagrams: [],
            };
          }

          // DB 저장
          const saved = await proposalRepository.createSection({
            projectId,
            outlineId: outline.id,
            sectionPath: leaf.path,
            title: leaf.title,
            content: sectionData.content ?? '',
            diagrams: JSON.stringify(sectionData.diagrams ?? []),
            status: 'generated',
          });

          generatedSections.push({
            id: saved.id,
            sectionPath: leaf.path,
            title: leaf.title,
            content: sectionData.content ?? '',
            diagrams: JSON.stringify(sectionData.diagrams ?? []),
            status: 'generated',
          });
        }

        send('progress', { step: '완료', progress: 100 });
        send('complete', { result: generatedSections });
      } catch {
        send('error', {
          error: { code: 'GENERATION_ERROR', message: '섹션 생성 중 오류가 발생했습니다' },
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
