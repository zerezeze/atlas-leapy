import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { aiConfig } from '../config';

export interface IEmbeddingService {
  generateEmbeddings(texts: string[]): Promise<number[][]>;
}

export class EmbeddingService implements IEmbeddingService {
  /**
   * Recebe um array de textos (chunks) e retorna um array de vetores (embeddings).
   * Utiliza o Vercel AI SDK para fazer a chamada ao provedor configurado.
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!texts || texts.length === 0) return [];

    try {
      // Utiliza o modelo configurado centralmente (ex: text-embedding-3-small)
      // O Vercel AI SDK gerencia o batch internamente e utiliza a chave
      // configurada na variável de ambiente (OPENAI_API_KEY).
      const { embeddings } = await embedMany({
        model: openai.embedding(aiConfig.defaultEmbeddingModel),
        values: texts,
      });

      return embeddings;
    } catch (error) {
      console.error('[EmbeddingService] Falha ao gerar embeddings:', error);
      throw new Error(
        'Não foi possível gerar os embeddings para os chunks informados.'
      );
    }
  }
}

// Singleton exportado para uso no pipeline de ingestão
export const embeddingService = new EmbeddingService();
