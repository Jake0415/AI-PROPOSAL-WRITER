import { generateText, getActiveProvider } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import { projectRepository } from '@/lib/repositories/project.repository';
import { getPrompt } from '@/lib/services/prompt.service';
import type { OutlineSection } from '@/lib/ai/types';
import type { SSEProgress } from '@/lib/utils/sse-stream';

// ─── Types ───────────────────────────────────────────────────

export interface GeneratedSection {
  id: string;
  sectionPath: string;
  title: string;
  content: string;
  diagrams: unknown[];
  status: string;
}

type ProgressCallback = (p: SSEProgress) => void;

interface FlatSection {
  title: string;
  path: string;
}

interface SectionContext {
  analysis: Record<string, unknown>;
  strategy: Record<string, unknown>;
  outline: { id: string; sections: OutlineSection[] };
  analysisJson: string;
  strategyJson: string;
  outlineJson: string;
  writingStyle?: string;
}

// ─── Helpers ─────────────────────────────────────────────────

function flattenLeafSections(
  sections: OutlineSection[],
  parentPath = '',
  filterChapterPath?: string,
): FlatSection[] {
  const result: FlatSection[] = [];
  for (const section of sections) {
    const path = parentPath
      ? `${parentPath}.${section.order}`
      : `${section.order}`;

    // 챕터 필터링: filterChapterPath가 지정되면 해당 챕터만
    if (filterChapterPath && !path.startsWith(filterChapterPath)) {
      continue;
    }

    if (!section.children || section.children.length === 0) {
      result.push({ title: section.title, path });
    } else {
      result.push(...flattenLeafSections(section.children, path, filterChapterPath));
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

// ─── 공통 컨텍스트 로딩 ──────────────────────────────────────

async function loadSectionContext(projectId: string): Promise<SectionContext> {
  const [analysis, strategy, outline] = await Promise.all([
    rfpRepository.getAnalysisByProjectId(projectId),
    proposalRepository.getStrategy(projectId),
    proposalRepository.getOutline(projectId),
  ]);

  if (!analysis || !strategy || !outline) {
    throw new Error('분석, 전략, 목차 데이터가 필요합니다. 이전 단계를 먼저 완료해주세요.');
  }

  const analysisJson = JSON.stringify({
    overview: analysis.overview,
    requirements: analysis.requirements,
    evaluationCriteria: analysis.evaluationCriteria,
  });

  const strategyJson = JSON.stringify({
    competitiveStrategy: strategy.competitiveStrategy,
    differentiators: strategy.differentiators,
    keyMessages: strategy.keyMessages,
  });

  const writingStyle = (strategy as Record<string, unknown>).writingStyle as string | undefined;

  return {
    analysis: analysis as unknown as Record<string, unknown>,
    strategy: strategy as unknown as Record<string, unknown>,
    outline: { id: outline.id, sections: outline.sections },
    analysisJson,
    strategyJson,
    outlineJson: JSON.stringify(outline.sections),
    writingStyle,
  };
}

// ─── 단일 섹션 생성 코어 (RAG 연동) ─────────────────────────

async function generateSingleSectionCore(
  projectId: string,
  leaf: FlatSection,
  ctx: SectionContext,
): Promise<GeneratedSection> {
  // RAG 검색으로 관련 RFP 원문 컨텍스트 가져오기
  let ragContext = '';
  try {
    const rfpFile = await rfpRepository.getFileByProjectId(projectId);
    if (rfpFile?.vectorStatus === 'completed') {
      const { ragSearch } = await import('@/lib/vector/rag.service');
      const cleanTitle = leaf.title.replace(/^[\d.]+\s*/, '');
      const ragResult = await ragSearch(projectId, cleanTitle, 10);
      if (ragResult.chunks.length > 0) {
        ragContext = ragResult.chunks.map(c => c.text).join('\n\n');
      }

      // 이미지 매칭 → on-demand Vision
      if (ragResult.imageMatches.length > 0 && getActiveProvider() === 'gpt') {
        try {
          const { analyzeImagesOnDemand } = await import('@/lib/vector/pdf-image.service');
          const matchedPaths = ragResult.imageMatches.map(m => m.imagePath).filter(Boolean);
          if (matchedPaths.length > 0) {
            const visionResults = await analyzeImagesOnDemand(matchedPaths);
            if (visionResults.length > 0) {
              ragContext += '\n\n--- 관련 이미지 분석 ---\n' + visionResults.map(v =>
                `[이미지]: ${v.description} (${v.keywords.join(', ')})`,
              ).join('\n');
            }
          }
        } catch { /* Vision 실패 시 텍스트만 */ }
      }
    }
  } catch { /* RAG 실패 시 기존 방식 폴백 */ }

  const prompt = await getPrompt('section-generation');
  const userPrompt = prompt.buildUserPrompt(
    leaf.title,
    leaf.path,
    ragContext ? ragContext.slice(0, 15000) : ctx.analysisJson.slice(0, 15000),
    ctx.strategyJson,
    ctx.outlineJson.slice(0, 10000),
    ctx.writingStyle,
  );

  const result = await generateText({
    systemPrompt: prompt.systemPrompt,
    userPrompt,
    maxTokens: prompt.maxTokens,
  });

  const sectionData = parseSectionResult(result);

  // upsert: 기존 있으면 업데이트, 없으면 생성
  const existing = await proposalRepository.getSectionByPath(projectId, leaf.path);
  let saved;
  if (existing) {
    await proposalRepository.updateSection(existing.id, {
      content: sectionData.content ?? '',
      diagrams: sectionData.diagrams ?? [],
      status: 'generated',
    });
    saved = { ...existing, content: sectionData.content ?? '', status: 'generated' };
  } else {
    saved = await proposalRepository.createSection({
      projectId,
      outlineId: ctx.outline.id,
      sectionPath: leaf.path,
      title: leaf.title,
      content: sectionData.content ?? '',
      diagrams: sectionData.diagrams ?? [],
      status: 'generated',
    });
  }

  return {
    id: saved.id,
    sectionPath: leaf.path,
    title: leaf.title,
    content: sectionData.content ?? '',
    diagrams: sectionData.diagrams ?? [],
    status: 'generated',
  };
}

// ─── 전체 생성 (기존 유지) ───────────────────────────────────

export async function generateSections(
  projectId: string,
  onProgress?: ProgressCallback,
  concurrency = 3,
): Promise<GeneratedSection[]> {
  onProgress?.({ step: '데이터 로딩', progress: 5 });
  const ctx = await loadSectionContext(projectId);

  const leafSections = flattenLeafSections(ctx.outline.sections);
  if (leafSections.length === 0) throw new Error('생성할 섹션이 없습니다.');

  onProgress?.({ step: `${leafSections.length}개 섹션 생성 시작`, progress: 10 });
  await projectRepository.updateStatus(projectId, 'generating');

  let completedCount = 0;
  const generatedSections = await runWithConcurrency(leafSections, concurrency, async (leaf) => {
    const result = await generateSingleSectionCore(projectId, leaf, ctx);
    completedCount++;
    onProgress?.({
      step: `[${completedCount}/${leafSections.length}] ${leaf.title} 완료`,
      progress: Math.round(10 + (completedCount / leafSections.length) * 80),
    });
    return result;
  });

  await projectRepository.updateStatus(projectId, 'sections_ready');
  onProgress?.({ step: '완료', progress: 100 });
  return generatedSections;
}

// ─── 챕터별 생성 (신규) ──────────────────────────────────────

export async function generateChapterSections(
  projectId: string,
  chapterPath: string,
  onProgress?: ProgressCallback,
  skipExisting = true,
  concurrency = 3,
): Promise<GeneratedSection[]> {
  onProgress?.({ step: '데이터 로딩', progress: 5 });
  const ctx = await loadSectionContext(projectId);

  let leafSections = flattenLeafSections(ctx.outline.sections, '', chapterPath);

  // 기존 생성된 섹션 제외
  if (skipExisting) {
    const existingSections = await proposalRepository.getSectionsByProject(projectId);
    const existingPaths = new Set(existingSections.filter(s => s.status !== 'pending').map(s => s.sectionPath));
    leafSections = leafSections.filter(s => !existingPaths.has(s.path));
  }

  if (leafSections.length === 0) {
    onProgress?.({ step: '생성할 섹션이 없습니다 (이미 완료)', progress: 100 });
    return [];
  }

  const stepLabels = leafSections.map((s, i) => `${i + 1}/${leafSections.length}: ${s.title}`);
  onProgress?.({
    step: `${leafSections.length}개 섹션 생성 시작`,
    progress: 10,
    steps: stepLabels,
    totalSteps: leafSections.length,
    stepIndex: 0,
  });

  let completedCount = 0;
  const generatedSections = await runWithConcurrency(leafSections, concurrency, async (leaf) => {
    const result = await generateSingleSectionCore(projectId, leaf, ctx);
    completedCount++;
    onProgress?.({
      step: `[${completedCount}/${leafSections.length}] ${leaf.title} 완료`,
      progress: Math.round(10 + (completedCount / leafSections.length) * 80),
      stepIndex: completedCount,
      totalSteps: leafSections.length,
    });
    return result;
  });

  onProgress?.({ step: '완료', progress: 100 });
  return generatedSections;
}
