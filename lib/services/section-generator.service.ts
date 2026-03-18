import { generateText } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import { projectRepository } from '@/lib/repositories/project.repository';
import {
  SECTION_SYSTEM_PROMPT,
  buildSectionPrompt,
} from '@/lib/ai/prompts/section-generation';
import type { OutlineSection } from '@/lib/ai/types';

// ─── Types ───────────────────────────────────────────────────

export interface GeneratedSection {
  id: string;
  sectionPath: string;
  title: string;
  content: string;
  diagrams: string;
  status: string;
}

import type { SSEProgress } from '@/lib/utils/sse-stream';

type ProgressCallback = (p: SSEProgress) => void;

interface FlatSection {
  title: string;
  path: string;
}

// ─── Helpers ─────────────────────────────────────────────────

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

function parseSectionResult(result: string): { content: string; diagrams: string[] } {
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
  } catch {
    return { content: result.slice(0, 3000), diagrams: [] };
  }
}

// ─── 병렬 실행 유틸리티 ──────────────────────────────────────

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

// ─── Main Service ────────────────────────────────────────────

export async function generateSections(
  projectId: string,
  onProgress?: ProgressCallback,
  concurrency = 3,
): Promise<GeneratedSection[]> {
  onProgress?.({ step: '데이터 로딩', progress: 5 });

  const [analysis, strategy, outline] = await Promise.all([
    rfpRepository.getAnalysisByProjectId(projectId),
    proposalRepository.getStrategy(projectId),
    proposalRepository.getOutline(projectId),
  ]);

  if (!analysis || !strategy || !outline) {
    throw new Error('분석, 전략, 목차 데이터가 필요합니다. 이전 단계를 먼저 완료해주세요.');
  }

  const analysisJson = JSON.stringify({
    overview: JSON.parse(analysis.overview),
    requirements: JSON.parse(analysis.requirements),
    evaluationCriteria: JSON.parse(analysis.evaluationCriteria),
  });
  const writingStyle = (strategy as Record<string, unknown>).writingStyle as string | undefined;
  const strategyJson = JSON.stringify({
    competitiveStrategy: strategy.competitiveStrategy,
    differentiators: JSON.parse(strategy.differentiators),
    keyMessages: JSON.parse(strategy.keyMessages),
  });
  const outlineSections: OutlineSection[] = JSON.parse(outline.sections);
  const outlineJson = JSON.stringify(outlineSections);

  const leafSections = flattenLeafSections(outlineSections);
  const totalSections = leafSections.length;

  if (totalSections === 0) {
    throw new Error('생성할 섹션이 없습니다.');
  }

  onProgress?.({ step: `${totalSections}개 섹션 생성 시작`, progress: 10 });
  await projectRepository.updateStatus(projectId, 'generating');

  let completedCount = 0;

  const generatedSections = await runWithConcurrency(
    leafSections,
    concurrency,
    async (leaf) => {
      const result = await generateText({
        systemPrompt: SECTION_SYSTEM_PROMPT,
        userPrompt: buildSectionPrompt(
          leaf.title,
          leaf.path,
          analysisJson,
          strategyJson,
          outlineJson,
          writingStyle,
        ),
        maxTokens: 4096,
      });

      const sectionData = parseSectionResult(result);

      const saved = await proposalRepository.createSection({
        projectId,
        outlineId: outline.id,
        sectionPath: leaf.path,
        title: leaf.title,
        content: sectionData.content ?? '',
        diagrams: JSON.stringify(sectionData.diagrams ?? []),
        status: 'generated',
      });

      completedCount++;
      const progress = Math.round(10 + (completedCount / totalSections) * 80);
      onProgress?.({
        step: `[${completedCount}/${totalSections}] ${leaf.title} 완료`,
        progress,
      });

      return {
        id: saved.id,
        sectionPath: leaf.path,
        title: leaf.title,
        content: sectionData.content ?? '',
        diagrams: JSON.stringify(sectionData.diagrams ?? []),
        status: 'generated',
      };
    },
  );

  await projectRepository.updateStatus(projectId, 'sections_ready');
  onProgress?.({ step: '완료', progress: 100 });

  return generatedSections;
}
