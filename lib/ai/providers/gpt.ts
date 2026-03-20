import OpenAI, { toFile } from 'openai';
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

  async uploadFile(buffer: Buffer, fileName: string): Promise<string> {
    const client = getClient();
    const file = await client.files.create({
      file: await toFile(buffer, fileName),
      purpose: 'assistants',
    });
    return file.id;
  },

  async generateWithFile(options: GenerateOptions & { fileId: string }): Promise<string> {
    const client = getClient();
    const response = await client.responses.create({
      model: options.model ?? process.env.AI_MODEL_GPT ?? DEFAULT_MODEL,
      input: [
        { role: 'system', content: options.systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'input_file',
              file_id: options.fileId,
            },
            {
              type: 'input_text',
              text: options.userPrompt,
            },
          ],
        },
      ],
      max_output_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
    });

    // Responses API 출력에서 텍스트 추출
    for (const item of response.output) {
      if (item.type === 'message') {
        for (const content of item.content) {
          if (content.type === 'output_text') {
            return content.text;
          }
        }
      }
    }
    return '';
  },
};
