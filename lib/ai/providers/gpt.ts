import OpenAI from 'openai';
import type { AiProviderInterface, GenerateOptions } from './types';

const DEFAULT_MODEL = 'gpt-4o';
const DEFAULT_MAX_TOKENS = 4096;

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _client;
}

export const gptProvider: AiProviderInterface = {
  async generateText(options: GenerateOptions): Promise<string> {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: options.model ?? process.env.AI_MODEL_GPT ?? DEFAULT_MODEL,
      max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: options.userPrompt },
      ],
      // JSON 출력 안정성 향상 (프롬프트에서 JSON 출력을 지시하는 경우)
      response_format: { type: 'json_object' },
    });

    return response.choices[0]?.message?.content ?? '';
  },

  async *generateStream(options: GenerateOptions): AsyncGenerator<string> {
    const client = getClient();
    const stream = await client.chat.completions.create({
      model: options.model ?? process.env.AI_MODEL_GPT ?? DEFAULT_MODEL,
      max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: options.userPrompt },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield delta;
      }
    }
  },
};
