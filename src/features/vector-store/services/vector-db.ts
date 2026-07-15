import { getSupabaseAdminClient } from '@/lib/supabase/client';
import { VectorDocumentChunk } from '../types';

export interface SearchResult extends Omit<
  VectorDocumentChunk,
  'embedding' | 'created_at' | 'updated_at'
> {
  similarity: number;
}

export class VectorDBService {
  /**
   * Salva os chunks no banco de dados.
   * Evita duplicação ao deletar previamente todos os chunks existentes
   * referentes aos documentos sendo reprocessados, garantindo que a base
   * reflita exatamente a versão mais recente do arquivo.
   */
  async upsertChunks(chunks: VectorDocumentChunk[]): Promise<void> {
    if (chunks.length === 0) return;

    const supabase = getSupabaseAdminClient();

    // Extrair lista de IDs de documentos para limpeza prévia
    const documentIds = Array.from(new Set(chunks.map((c) => c.document_id)));

    // 1. Limpeza: Deleta chunks antigos desses documentos para evitar órfãos
    const { error: deleteError } = await supabase
      .from('knowledge_chunks')
      .delete()
      .in('document_id', documentIds);

    if (deleteError) {
      console.error(
        '[VectorDBService] Erro ao limpar chunks antigos:',
        deleteError
      );
      throw new Error(`Falha na limpeza prévia: ${deleteError.message}`);
    }

    // 2. Inserção: Salva os novos chunks com embeddings
    const { error: insertError } = await supabase
      .from('knowledge_chunks')
      .insert(chunks);

    if (insertError) {
      console.error(
        '[VectorDBService] Erro ao inserir novos chunks:',
        insertError
      );
      throw new Error(`Falha na inserção de vetores: ${insertError.message}`);
    }
  }

  /**
   * Executa a busca vetorial no Supabase chamando a Remote Procedure Call (RPC) `match_chunks`.
   */
  async searchChunks(
    queryEmbedding: number[],
    organizationId: string,
    matchCount: number = 5,
    matchThreshold: number = 0.5
  ): Promise<SearchResult[]> {
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      p_organization_id: organizationId,
    });

    if (error) {
      console.error('[VectorDBService] Erro na busca vetorial:', error);
      throw new Error(`Falha ao buscar similaridade: ${error.message}`);
    }

    return data as SearchResult[];
  }
}

export const vectorDBService = new VectorDBService();
