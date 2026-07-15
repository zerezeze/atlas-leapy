/**
 * Tipagem que reflete exatamente a estrutura da tabela `knowledge_chunks` no Supabase PostgreSQL.
 */
export interface VectorDocumentChunk {
  id: string; // Hash gerado pelo chunking
  document_id: string; // Ref para o documento original
  organization_id: string; // Organização ao qual o chunk pertence
  content: string; // Texto fatiado
  metadata: Record<string, unknown>; // JSONB (source, title, chunkIndex, etc)
  embedding?: number[] | null; // Array contendo os floats do vetor (nulo antes de gerar a IA)
  created_at: string; // Timestamptz
  updated_at: string; // Timestamptz
}
