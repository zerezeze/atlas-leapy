import { embeddingService } from '@/features/ai/services/embedding-service';
import {
  vectorDBService,
  SearchResult,
} from '@/features/vector-store/services/vector-db';

export class RetrievalService {
  /**
   * Ponto de entrada do sistema de recuperação (Retrieval).
   * 1. Converte a string de busca em embedding usando a mesma camada de IA da ingestão.
   * 2. Aciona o Vector Store para buscar os "Top K" chunks mais próximos semanticamente.
   */
  async retrieveContext(
    question: string,
    organizationId: string,
    topK: number = 5
  ): Promise<SearchResult[]> {
    if (!question || !question.trim()) {
      return [];
    }

    // Gerar o vetor matemático para a pergunta do usuário
    const embeddings = await embeddingService.generateEmbeddings([question]);

    if (embeddings.length === 0) {
      throw new Error('Não foi possível gerar embedding para a pergunta.');
    }
    const queryEmbedding = embeddings[0];

    // Buscar no banco via similaridade de cosseno, usando limiar mínimo (threshold) de 0.5
    const results = await vectorDBService.searchChunks(
      queryEmbedding,
      organizationId,
      topK,
      0.5
    );

    return results;
  }
}

export const retrievalService = new RetrievalService();
