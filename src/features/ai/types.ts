import { ZodType } from 'zod';

export type AIProviderName = 'openai' | 'anthropic' | 'google';

export interface AIModelConfig {
  provider: AIProviderName;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIGenerationRequest {
  prompt: string;
  systemPrompt?: string;
  config?: Partial<AIModelConfig>;
}

export interface AIStreamObjectRequest<T> extends AIGenerationRequest {
  schema: ZodType<T>;
}

export interface AIStreamObjectResponse<T> {
  partialObjectStream: AsyncIterable<Partial<T>>;
}

export interface AIGenerationResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ILLMService {
  generateText(request: AIGenerationRequest): Promise<AIGenerationResponse>;
  streamObject<T>(
    request: AIStreamObjectRequest<T>
  ): Promise<AIStreamObjectResponse<T>>;
}
