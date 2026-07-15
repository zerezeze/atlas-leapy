import { env } from '@/config/env';
import { AIModelConfig } from './types';

/**
 * Centralized AI Configuration
 * Decouples the application from hardcoded model names and API keys.
 */
export const aiConfig = {
  defaultProvider: env.DEFAULT_AI_PROVIDER,
  defaultEmbeddingModel: 'text-embedding-3-small',
  providers: {
    openai: {
      defaultModel: 'gpt-4o',
      apiKey: env.OPENAI_API_KEY,
    },
    anthropic: {
      defaultModel: 'claude-3-5-sonnet-20240620',
      apiKey: env.ANTHROPIC_API_KEY,
    },
    google: {
      defaultModel: 'gemini-1.5-pro',
      apiKey: env.GOOGLE_API_KEY,
    },
  },
};

/**
 * Resolves the configuration for the selected provider.
 */
export const getDefaultModelConfig = (): AIModelConfig => {
  const provider = aiConfig.defaultProvider;
  return {
    provider,
    modelName: aiConfig.providers[provider]?.defaultModel || 'unknown',
    temperature: 0.1, // Lower temperature prioritized for precision in RAG
  };
};
