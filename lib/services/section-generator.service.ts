import { generateText, getActiveProvider } from '@/lib/ai/client';
import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import { projectRepository } from '@/lib/repositories/project.repository';
import { getPrompt } from '@/lib/services/prompt.service';
import type { OutlineSection } from '@/lib/ai/types';
import type { SSEProgress } from '@/lib/utils/sse-stream';

export interface GeneratedSection {
  id: string;
  sectionPath: string;
  title: string;
  content: string;
  diagrams: unknown[];
  status: string;
}

type ProgressCallback = (p: SSEProgress) => void;

interface SectionContext {
  outline: { id: string; sections: OutlineSection[] };
  contextJson: string;
}

async function loadSectionContext(projectId: string): Promise<SectionContext> {
  const [analysis, strategy, outline] = await Promise.all([
    rfpRepository.getAnalysisByProjectId(projectId),
    proposalRepository.getStrategy(projectId),
    proposalRepository.getOutline(projectId),
  ]);
  if (!analysis || !strategy || !outline) {
    throw new Error('분석, 전략, 목차 데이터가 필요합니다.');
  }
  return {
    outline: { id: outline.id, sections: outline.sections },
    contextJson: JSON.stringify({
      overview: analysis.overview,
      requirements: (analysis.requirements ?? []).slice(0, 30),
      evaluationCriteria: analysis.evaluationCriteria,
      competitiveStrategy: strategy.competitiveStrategy,
      differentiators: strategy.differentiators,
      keyMessages: strategy.keyMessages,
    }),
  };
}

async function searchRagContext(projectId: string, title: string): Promise<string> {
  try {
    const rfpFile = await rfpRepository.getFileByProjectId(projectId);
    if (rfpFile?.vectorStatus !== 'completed') return '';
    const { ragSearch } = await import('@/lib/vector/rag.service');
    const result = await ragSearch(projectId, title.replace(/^[\d.]+\s*/, ''), 10);
    let context = result.chunks.map(c => c.text).join('\n\n');
    if (result.imageMatches.length > 0 && getActiveProvider() === 'gpt') {
      try {
        const { analyzeImagesOnDemand } = await import('@/lib/vector/pdf-image.service');
        const paths = result.imageMatches.map(m => m.imagePath).filter(Boolean);
        if (paths.length > 0) {
          const vr = await analyzeImagesOnDemand(paths);
          context += '\n\n--- 관련 이미지 ---\n' + vr.map(v => `[이미지]: ${v.description}`).join('\n');
        }
      } catch { /* ignore */ }
    }
    return context;
  } catch { return ''; }
}

function parseSectionResult(result: string): { content: string; diagrams: string[] } {
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
  } catch {
    return { content: result.slice(0, 5000), diagrams: [] };
  }
}

async function generateSubChapterContent(
  projectId: string,
  subChapter: OutlineSection,
  subChapterPath: string,
  previousResults: string,
  ctx: SectionContext,
): Promise<GeneratedSection> {
  const childSections = (subChapter.children ?? []).map((c, i) => `${i + 1}. ${c.title}`).join('\n');
  const ragContext = await searchRagContext(projectId, subChapter.title);

  const prompt = await getPrompt('section-generation');
  const userPrompt = prompt.buildUserPrompt(
    subChapter.title, subChapterPath,
    childSections || subChapter.title,
    ctx.contextJson, previousResults, ragContext,
  );

  const result = await generateText({
    systemPrompt: prompt.systemPrompt,
    userPrompt,
    maxTokens: prompt.maxTokens,
  });

  const data = parseSectionResult(result);
  const existing = await proposalRepository.getSectionByPath(projectId, subChapterPath);
  let saved;
  if (existing) {
    await proposalRepository.updateSection(existing.id, {
      content: data.content ?? '', diagrams: data.diagrams ?? [], status: 'generated',
    });
    saved = { ...existing, content: data.content ?? '', status: 'generated' };
  } else {
    saved = await proposalRepository.createSection({
      projectId, outlineId: ctx.outline.id, sectionPath: subChapterPath,
      title: subChapter.title, content: data.content ?? '',
      diagrams: data.diagrams ?? [], status: 'generated',
    });
  }

  return {
    id: saved.id, sectionPath: subChapterPath, title: subChapter.title,
    content: data.content ?? '', diagrams: data.diagrams ?? [], status: 'generated',
  };
}

export async function generateChapterSections(
  projectId: string, chapterPath: string,
  onProgress?: ProgressCallback, skipExisting = true,
): Promise<GeneratedSection[]> {
  onProgress?.({ step: '데이터 로딩', progress: 5 });
  const ctx = await loadSectionContext(projectId);

  const chapterOrder = parseInt(chapterPath, 10);
  const chapter = ctx.outline.sections.find(s => s.order === chapterOrder);
  if (!chapter?.children?.length) throw new Error('서브 챕터가 없습니다.');

  let subChapters = chapter.children;
  if (skipExisting) {
    const existing = await proposalRepository.getSectionsByProject(projectId);
    const donePaths = new Set(existing.filter(s => s.status === 'generated' || s.status === 'edited').map(s => s.sectionPath));
    subChapters = subChapters.filter(sc => !donePaths.has(`${chapterPath}.${sc.order}`));
  }

  if (subChapters.length === 0) {
    onProgress?.({ step: '이미 생성 완료', progress: 100 });
    return [];
  }

  onProgress?.({
    step: `${subChapters.length}개 서브 챕터 생성 시작`, progress: 10,
    steps: subChapters.map((sc, i) => `${i + 1}/${subChapters.length}: ${sc.title}`),
    totalSteps: subChapters.length, stepIndex: 0,
  });

  const results: GeneratedSection[] = [];
  let previousResults = '';

  for (let i = 0; i < subChapters.length; i++) {
    const sc = subChapters[i];
    const scPath = `${chapterPath}.${sc.order}`;
    onProgress?.({
      step: `서브 챕터 ${i + 1}/${subChapters.length}: ${sc.title}`,
      progress: 10 + Math.round(((i + 1) / subChapters.length) * 80),
      stepIndex: i, totalSteps: subChapters.length,
    });

    const gen = await generateSubChapterContent(projectId, sc, scPath, previousResults, ctx);
    results.push(gen);
    previousResults += `\n\n### ${sc.title}\n${gen.content.slice(0, 2000)}`;
  }

  onProgress?.({ step: '완료', progress: 100 });
  return results;
}

export async function generateSections(
  projectId: string, onProgress?: ProgressCallback,
): Promise<GeneratedSection[]> {
  onProgress?.({ step: '데이터 로딩', progress: 5 });
  const ctx = await loadSectionContext(projectId);
  await projectRepository.updateStatus(projectId, 'generating');

  const allResults: GeneratedSection[] = [];
  for (let ci = 0; ci < ctx.outline.sections.length; ci++) {
    const chapter = ctx.outline.sections[ci];
    onProgress?.({
      step: `챕터 ${ci + 1}/${ctx.outline.sections.length}: ${chapter.title}`,
      progress: Math.round(5 + (ci / ctx.outline.sections.length) * 90),
    });
    const chapterResults = await generateChapterSections(projectId, `${chapter.order}`, undefined, true);
    allResults.push(...chapterResults);
  }

  await projectRepository.updateStatus(projectId, 'sections_ready');
  onProgress?.({ step: '완료', progress: 100 });
  return allResults;
}

export async function regenerateSubChapter(
  projectId: string, subChapterPath: string,
): Promise<GeneratedSection> {
  const ctx = await loadSectionContext(projectId);
  const parts = subChapterPath.split('.');
  const chapter = ctx.outline.sections.find(s => s.order === parseInt(parts[0], 10));
  const subChapter = chapter?.children?.find(s => s.order === parseInt(parts[1], 10));
  if (!subChapter) throw new Error('서브 챕터를 찾을 수 없습니다.');

  const existing = await proposalRepository.getSectionsByProject(projectId);
  const previous = existing
    .filter(s => s.sectionPath.startsWith(`${parts[0]}.`) && s.sectionPath < subChapterPath)
    .sort((a, b) => a.sectionPath.localeCompare(b.sectionPath))
    .map(s => `### ${s.title}\n${s.content.slice(0, 1500)}`).join('\n\n');

  return generateSubChapterContent(projectId, subChapter, subChapterPath, previous, ctx);
}
