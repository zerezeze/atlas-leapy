import { generateText, streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import {
  AIGenerationRequest,
  AIGenerationResponse,
  ILLMService,
  AIStreamObjectRequest,
  AIStreamObjectResponse,
} from '../types';
import { getDefaultModelConfig } from '../config';

/**
 * Foundation of the LLM Service.
 * Acts as an adapter/facade over the Vercel AI SDK to prevent the
 * rest of the application from being coupled to a specific provider's API.
 */
export class LLMService implements ILLMService {
  async generateText(
    request: AIGenerationRequest
  ): Promise<AIGenerationResponse> {
    const config = { ...getDefaultModelConfig(), ...request.config };

    console.log(
      `[LLMService] Routing request to: ${config.provider} (${config.modelName})`
    );

    try {
      const { text, usage } = await generateText({
        // Utilizando OpenAI diretamente conforme arquitetura MVP
        // Futuramente pode ser abstraído baseado no config.provider
        model: openai(config.modelName),
        system: request.systemPrompt,
        prompt: request.prompt,
        temperature: config.temperature,
      });

      // Tratamento seguro para os tokens retornados
      const usageStats = usage as {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
      };

      return {
        text,
        usage: {
          promptTokens: usageStats?.promptTokens ?? 0,
          completionTokens: usageStats?.completionTokens ?? 0,
          totalTokens: usageStats?.totalTokens ?? 0,
        },
      };
    } catch (error) {
      console.error('[LLMService] Erro ao gerar texto com IA:', error);
      throw new Error('Falha ao comunicar com o modelo de IA.');
    }
  }

  async streamObject<T>(
    request: AIStreamObjectRequest<T>
  ): Promise<AIStreamObjectResponse<T>> {
    const config = { ...getDefaultModelConfig(), ...request.config };

    console.log(
      `[LLMService] Streaming request to: ${config.provider} (${config.modelName})`
    );

    try {
      const result = await streamObject({
        model: openai(config.modelName),
        system: request.systemPrompt,
        prompt: request.prompt,
        temperature: config.temperature,
        schema: request.schema,
      });
      return result as unknown as AIStreamObjectResponse<T>;
    } catch (error) {
      console.error('[LLMService] Erro ao stremar objeto com IA:', error);
      throw new Error('Falha ao comunicar com o modelo de IA em modo stream.');
    }
  }
}

// Export a singleton instance to be used across the app
export const llmService = new LLMService();
