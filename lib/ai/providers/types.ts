// AI 프로바이더 공통 타입

export type AiProvider = 'claude' | 'gpt';

export interface GenerateOptions {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  maxTokens?: number;
}

export interface AiProviderInterface {
  generateText(options: GenerateOptions): Promise<string>;
  generateStream(options: GenerateOptions): AsyncGenerator<string>;
  uploadFile?(buffer: Buffer, fileName: string): Promise<string>;
  generateWithFile?(options: GenerateOptions & { fileId: string }): Promise<string>;
}
