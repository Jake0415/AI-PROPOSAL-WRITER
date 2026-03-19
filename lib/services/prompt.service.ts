import { promptTemplateRepository } from '@/lib/repositories/prompt-template.repository';
import { DEFAULT_PROMPTS, type DefaultPromptDef } from '@/lib/ai/prompts/defaults';
import { renderTemplate } from '@/lib/ai/prompts/template-engine';
import { auditService } from '@/lib/services/audit.service';

export interface ResolvedPrompt {
  systemPrompt: string;
  maxTokens: number;
  source: 'db' | 'default';
  slug: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buildUserPrompt: (...args: any[]) => string;
}

// 인메모리 캐시 (5분 TTL)
const cache = new Map<string, { data: ResolvedPrompt; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export function invalidateCache(slug?: string) {
  if (slug) {
    cache.delete(slug);
  } else {
    cache.clear();
  }
}

export async function getPrompt(slug: string): Promise<ResolvedPrompt> {
  const cached = cache.get(slug);
  if (cached && cached.expiry > Date.now()) return cached.data;

  const defaultDef = DEFAULT_PROMPTS[slug];
  if (!defaultDef) throw new Error(`Unknown prompt slug: ${slug}`);

  let resolved: ResolvedPrompt;

  try {
    const dbTemplate = await promptTemplateRepository.findBySlug(slug);

    if (dbTemplate && dbTemplate.isActive) {
      resolved = {
        slug,
        systemPrompt: dbTemplate.systemPrompt,
        maxTokens: dbTemplate.maxTokens,
        source: 'db',
        buildUserPrompt: (...args: unknown[]) => {
          // DB 템플릿에 변수가 있으면 renderTemplate로 치환
          if (dbTemplate.userPromptTemplate.includes('{{')) {
            const variables = mapArgsToVariables(slug, args);
            return renderTemplate(dbTemplate.userPromptTemplate, variables);
          }
          // 변수가 없으면 기본 build 함수 사용
          return defaultDef.buildUserPrompt(...args);
        },
      };
    } else {
      resolved = buildDefaultResolved(slug, defaultDef);
    }
  } catch {
    // DB 오류 시 기본값 fallback
    resolved = buildDefaultResolved(slug, defaultDef);
  }

  cache.set(slug, { data: resolved, expiry: Date.now() + CACHE_TTL });
  return resolved;
}

function buildDefaultResolved(slug: string, def: DefaultPromptDef): ResolvedPrompt {
  return {
    slug,
    systemPrompt: def.systemPrompt,
    maxTokens: def.maxTokens,
    source: 'default',
    buildUserPrompt: def.buildUserPrompt,
  };
}

/**
 * slug별 인자 → 변수 매핑
 * DB에서 userPromptTemplate을 오버라이드할 때 {{variable}} 치환에 사용
 */
function mapArgsToVariables(slug: string, args: unknown[]): Record<string, string> {
  const str = (v: unknown) => typeof v === 'string' ? v : JSON.stringify(v);

  switch (slug) {
    case 'rfp-analysis':
      return { rfpText: str(args[0]) };
    case 'direction-generation':
    case 'competitive-analysis':
      return { analysisJson: str(args[0]) };
    case 'strategy-generation':
      return { analysisJson: str(args[0]), directionJson: str(args[1]), writingStyle: str(args[2]) };
    case 'outline-generation':
      return { analysisJson: str(args[0]), strategyJson: str(args[1]) };
    case 'section-generation':
      return {
        sectionTitle: str(args[0]), sectionPath: str(args[1]),
        analysisJson: str(args[2]), strategyJson: str(args[3]),
        outlineJson: str(args[4]), writingStyle: str(args[5]),
      };
    case 'review-generation':
      return { analysisJson: str(args[0]), sectionsJson: str(args[1]), strategyJson: str(args[2]) };
    case 'price-generation':
      return { analysisJson: str(args[0]), sectionsJson: str(args[1]) };
    case 'coaching':
      return { stepKey: str(args[0]), stepData: str(args[1]) };
    default:
      return {};
  }
}

/**
 * 프롬프트 수정 (관리자용)
 * 기존 버전을 자동으로 versions 테이블에 저장
 */
export async function updatePrompt(slug: string, data: {
  systemPrompt: string;
  userPromptTemplate: string;
  maxTokens: number;
  changeNote?: string;
  userId?: string;
}) {
  const defaultDef = DEFAULT_PROMPTS[slug];
  if (!defaultDef) throw new Error(`Unknown prompt slug: ${slug}`);

  let existing = await promptTemplateRepository.findBySlug(slug);

  if (!existing) {
    // Lazy creation: 처음 수정 시 DB 레코드 생성
    existing = await promptTemplateRepository.create({
      slug,
      name: defaultDef.name,
      description: defaultDef.description,
      category: defaultDef.category,
      systemPrompt: defaultDef.systemPrompt,
      userPromptTemplate: '',
      maxTokens: defaultDef.maxTokens,
    });
  }

  // 기존 버전을 versions 테이블에 보관
  await promptTemplateRepository.createVersion({
    templateId: existing.id,
    version: existing.version,
    systemPrompt: existing.systemPrompt,
    userPromptTemplate: existing.userPromptTemplate,
    maxTokens: existing.maxTokens,
    changedBy: data.userId,
    changeNote: data.changeNote ?? '',
  });

  // 업데이트
  const updated = await promptTemplateRepository.update(existing.id, {
    systemPrompt: data.systemPrompt,
    userPromptTemplate: data.userPromptTemplate,
    maxTokens: data.maxTokens,
    version: existing.version + 1,
  });

  invalidateCache(slug);

  await auditService.log({
    userId: data.userId,
    action: 'prompt.update',
    resourceType: 'prompt',
    resourceId: slug,
    details: { version: existing.version + 1, changeNote: data.changeNote },
  });

  return updated;
}

/**
 * 특정 버전으로 되돌리기
 */
export async function revertToVersion(slug: string, version: number, userId?: string) {
  const existing = await promptTemplateRepository.findBySlug(slug);
  if (!existing) throw new Error(`Prompt not found: ${slug}`);

  const targetVersion = await promptTemplateRepository.getVersion(existing.id, version);
  if (!targetVersion) throw new Error(`Version ${version} not found`);

  // 현재 상태를 versions에 저장
  await promptTemplateRepository.createVersion({
    templateId: existing.id,
    version: existing.version,
    systemPrompt: existing.systemPrompt,
    userPromptTemplate: existing.userPromptTemplate,
    maxTokens: existing.maxTokens,
    changedBy: userId,
    changeNote: `v${version}으로 되돌리기`,
  });

  const updated = await promptTemplateRepository.update(existing.id, {
    systemPrompt: targetVersion.systemPrompt,
    userPromptTemplate: targetVersion.userPromptTemplate,
    maxTokens: targetVersion.maxTokens,
    version: existing.version + 1,
  });

  invalidateCache(slug);

  await auditService.log({
    userId,
    action: 'prompt.revert',
    resourceType: 'prompt',
    resourceId: slug,
    details: { revertedToVersion: version, newVersion: existing.version + 1 },
  });

  return updated;
}

/**
 * DB 오버라이드 삭제 (기본값으로 복원)
 */
export async function resetToDefault(slug: string) {
  await promptTemplateRepository.deleteBySlug(slug);
  invalidateCache(slug);
}
