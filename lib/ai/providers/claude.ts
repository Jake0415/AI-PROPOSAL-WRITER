import Anthropic from '@anthropic-ai/sdk';
import type { AiProviderInterface, GenerateOptions } from './types';

const DEFAULT_MODEL = 'claude-sonnet-4-6';
const DEFAULT_MAX_TOKENS = 4096;

let _client: Anthropic | null = null;
let _lastApiKey: string | undefined;

export function resetClaudeClient() { _client = null; }

function getClient(apiKey?: string): Anthropic {
  const key = apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!_client || key !== _lastApiKey) {
    _client = new Anthropic({ apiKey: key });
    _lastApiKey = key;
  }
  return _client;
}

export const claudeProvider: AiProviderInterface = {
  async generateText(options: GenerateOptions): Promise<string> {
    const { getApiKey } = await import('@/lib/ai/client');
    const apiKey = await getApiKey('claude');
    const client = getClient(apiKey);
    const response = await client.messages.create({
      model: options.model ?? process.env.AI_MODEL_CLAUDE ?? DEFAULT_MODEL,
      max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
      system: options.systemPrompt,
      messages: [{ role: 'user', content: options.userPrompt }],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    return textBlock?.text ?? '';
  },

  async *generateStream(options: GenerateOptions): AsyncGenerator<string> {
    const { getApiKey } = await import('@/lib/ai/client');
    const apiKey = await getApiKey('claude');
    const client = getClient(apiKey);
    const stream = client.messages.stream({
      model: options.model ?? process.env.AI_MODEL_CLAUDE ?? DEFAULT_MODEL,
      max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
      system: options.systemPrompt,
      messages: [{ role: 'user', content: options.userPrompt }],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  },
};
