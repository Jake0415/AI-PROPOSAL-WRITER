import { conversationRepository } from '@/lib/repositories/conversation.repository';
import { generateStream, getActiveProvider } from '@/lib/ai/client';
import { getPrompt } from '@/lib/services/prompt.service';
import type { ConversationTopic } from '@/lib/db/schema';

const TOPIC_PROMPT_MAP: Record<ConversationTopic, string> = {
  'rfp-analysis': 'coaching',
  'direction-coaching': 'coaching',
  'strategy-coaching': 'coaching',
  'outline-coaching': 'coaching',
  'section-editing': 'coaching',
  'review-coaching': 'coaching',
  'price-coaching': 'coaching',
  'general': 'coaching',
};

export const conversationService = {
  async startConversation(projectId: string, userId: string, topic: ConversationTopic, stageContext?: Record<string, unknown>) {
    return conversationRepository.create({ projectId, userId, topic, stageContext });
  },

  async* sendMessage(conversationId: string, userMessage: string): AsyncGenerator<string> {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) throw new Error('대화를 찾을 수 없습니다');

    // 사용자 메시지 저장
    await conversationRepository.addMessage({
      conversationId,
      role: 'user',
      content: userMessage,
    });

    // 이전 대화 이력 로드
    const history = await conversationRepository.getMessages(conversationId);

    // 프롬프트 로드
    const promptSlug = TOPIC_PROMPT_MAP[conversation.topic] ?? 'coaching';
    const resolved = await getPrompt(promptSlug);

    // 대화 이력을 컨텍스트로 구성
    const contextMessages = history.slice(-20).map(m =>
      `[${m.role === 'user' ? '사용자' : 'AI'}]: ${m.content}`
    ).join('\n\n');

    const stageInfo = conversation.stageContext
      ? `\n\n현재 단계 컨텍스트:\n${JSON.stringify(conversation.stageContext, null, 2)}`
      : '';

    const userPrompt = `이전 대화 이력:\n${contextMessages}${stageInfo}\n\n현재 사용자 질문:\n${userMessage}`;

    // LLM 스트리밍 호출
    const startTime = Date.now();
    let fullResponse = '';

    const stream = generateStream({
      systemPrompt: resolved.systemPrompt,
      userPrompt,
      maxTokens: resolved.maxTokens,
    });

    for await (const chunk of stream) {
      fullResponse += chunk;
      yield chunk;
    }

    const latencyMs = Date.now() - startTime;

    // assistant 메시지 저장
    await conversationRepository.addMessage({
      conversationId,
      role: 'assistant',
      content: fullResponse,
    });

    // LLM 호출 로그 기록 (토큰은 추정치)
    const estimatedPromptTokens = Math.ceil(userPrompt.length / 4);
    const estimatedCompletionTokens = Math.ceil(fullResponse.length / 4);

    await conversationRepository.logLlmCall({
      projectId: conversation.projectId,
      conversationId,
      service: `conversation-${conversation.topic}`,
      provider: getActiveProvider(),
      model: 'default',
      promptTokens: estimatedPromptTokens,
      completionTokens: estimatedCompletionTokens,
      totalCost: '0',
      latencyMs,
    });
  },

  async getHistory(conversationId: string) {
    return conversationRepository.getMessages(conversationId);
  },

  async listConversations(projectId: string) {
    return conversationRepository.findByProject(projectId, 'active');
  },

  async archiveConversation(conversationId: string) {
    return conversationRepository.archive(conversationId);
  },
};
