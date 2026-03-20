import { generateText } from '@/lib/ai/client';
import { promptTemplateRepository } from '@/lib/repositories/prompt-template.repository';
import { getPrompt, invalidateCache } from '@/lib/services/prompt.service';
import { RFP_STEP_DEFINITIONS } from '@/lib/ai/prompts/rfp-steps';

const META_SYSTEM_PROMPT = `당신은 AI 프롬프트 엔지니어링 전문가입니다.
주어진 분석 단계에 맞는 시스템 프롬프트와 사용자 프롬프트 템플릿을 생성합니다.
한국 공공입찰 제안서 분석에 특화된 프롬프트를 작성합니다.
반드시 순수 JSON으로만 응답하세요.`;

/**
 * 단계에 프롬프트가 없으면 메타 프롬프트로 자동 생성하여 DB에 저장
 */
export async function ensureStepPrompt(slug: string): Promise<void> {
  // 이미 DB에 있는지 확인
  const existing = await promptTemplateRepository.findBySlug(slug);
  if (existing && existing.isActive) return;

  // 기본값에 있는지 확인
  try {
    await getPrompt(slug);
    return; // 기본값이 있으면 그것 사용
  } catch {
    // 기본값도 없으면 자동 생성
  }

  const stepDef = RFP_STEP_DEFINITIONS.find(s => s.slug === slug);
  if (!stepDef) return;

  const userPrompt = `다음 RFP 분석 단계에 필요한 프롬프트를 생성하세요.

## 단계 정보
- 단계 번호: ${stepDef.stepNumber}
- 단계명: ${stepDef.name}
- 설명: ${stepDef.label}

## 출력 JSON
{
  "systemPrompt": "시스템 프롬프트 (분석 전문가 역할, 한국 공공입찰 특화, JSON 응답 지시)",
  "userPromptTemplate": "사용자 프롬프트 템플릿 ({{rfpText}}, {{previousResults}} 변수 사용 가능)"
}`;

  const result = await generateText({
    systemPrompt: META_SYSTEM_PROMPT,
    userPrompt,
    maxTokens: 4096,
  });

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);

    // DB에 저장
    await promptTemplateRepository.create({
      slug,
      name: stepDef.name,
      description: `자동 생성: ${stepDef.label}`,
      category: 'analysis',
      systemPrompt: parsed.systemPrompt || `${stepDef.label} 분석 전문가`,
      userPromptTemplate: parsed.userPromptTemplate || '',
      maxTokens: 8192,
    });

    invalidateCache(slug);
  } catch {
    // 파싱 실패 시 무시 (기본값으로 폴백)
  }
}
