import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;

export function getAiClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _client;
}

export const AI_MODEL = 'claude-sonnet-4-6' as const;
export const MAX_TOKENS = 4096;

interface GenerateOptions {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  maxTokens?: number;
}

export async function generateText(options: GenerateOptions): Promise<string> {
  const client = getAiClient();

  const response = await client.messages.create({
    model: options.model ?? AI_MODEL,
    max_tokens: options.maxTokens ?? MAX_TOKENS,
    system: options.systemPrompt,
    messages: [{ role: 'user', content: options.userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock?.text ?? '';
}

export async function* generateStream(options: GenerateOptions): AsyncGenerator<string> {
  const client = getAiClient();

  const stream = client.messages.stream({
    model: options.model ?? AI_MODEL,
    max_tokens: options.maxTokens ?? MAX_TOKENS,
    system: options.systemPrompt,
    messages: [{ role: 'user', content: options.userPrompt }],
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text;
    }
  }
}
