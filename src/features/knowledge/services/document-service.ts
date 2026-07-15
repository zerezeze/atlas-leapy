import { getSupabaseAdminClient } from '@/lib/supabase/client';

export interface KnowledgeDocument {
  id: string;
  filename: string;
  mime_type: string;
  size: number;
  created_at: Date;
  updated_at: Date;
  chunk_count?: number; // Calculado via Join/Count
}

export class DocumentService {
  /**
   * Lista todos os documentos e a quantidade de chunks associados a eles.
   */
  async listDocuments(organizationId: string): Promise<KnowledgeDocument[]> {
    const supabase = getSupabaseAdminClient();

    // Obtém documentos
    const { data: docs, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (docsError) {
      console.error('[DocumentService] Erro ao listar documentos:', docsError);
      throw new Error('Falha ao listar base de conhecimento.');
    }

    // Para evitar múltiplas queries, podemos contar os chunks de uma vez via RPC ou groupBy
    // Mas para simplicidade e baixo volume, vamos fazer um select count simplificado ou
    // buscar os counts por document_id.
    const docIds = docs.map((d) => d.id);

    if (docIds.length === 0) return [];

    const { data: chunksData, error: chunksError } = await supabase
      .from('knowledge_chunks')
      .select('document_id')
      .eq('organization_id', organizationId);

    if (chunksError) {
      console.error('[DocumentService] Erro ao contar chunks:', chunksError);
      throw new Error('Falha ao contar chunks.');
    }

    const chunksCountMap = chunksData.reduce(
      (acc: Record<string, number>, chunk) => {
        acc[chunk.document_id] = (acc[chunk.document_id] || 0) + 1;
        return acc;
      },
      {}
    );

    return docs.map((d) => ({
      ...d,
      created_at: new Date(d.created_at),
      updated_at: new Date(d.updated_at),
      chunk_count: chunksCountMap[d.id] || 0,
    }));
  }

  /**
   * Insere um novo documento no catálogo.
   */
  async createDocument(
    filename: string,
    mimeType: string,
    size: number,
    organizationId: string
  ): Promise<KnowledgeDocument> {
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('documents')
      .insert({
        filename,
        mime_type: mimeType,
        size,
        organization_id: organizationId,
      })
      .select()
      .single();

    if (error) {
      console.error('[DocumentService] Erro ao criar documento:', error);
      throw new Error('Falha ao registrar documento.');
    }

    return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  }

  /**
   * Deleta o documento do catálogo.
   * (A exclusão dos chunks será feita via VectorDBService ou manualmente na action)
   */
  async deleteDocument(id: string, organizationId: string): Promise<void> {
    const supabase = getSupabaseAdminClient();

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('[DocumentService] Erro ao excluir documento:', error);
      throw new Error('Falha ao excluir documento.');
    }
  }
}

export const documentService = new DocumentService();
