import 'dotenv/config';
import { loadAllDocuments } from '../features/knowledge-base';
import { chunkDocument } from '../features/knowledge-base/services/chunking';
import { embeddingService } from '../features/ai/services/embedding-service';
import { vectorDBService } from '../features/vector-store/services/vector-db';
import { VectorDocumentChunk } from '../features/vector-store/types';

/**
 * Script isolado para orquestrar a ingestão completa de dados no Atlas.
 * Lê arquivos Markdown -> Faze Chunking -> Gera Embeddings -> Salva no Supabase.
 */
async function runIngestion() {
  console.log('🚀 Iniciando pipeline de ingestão do Atlas...\n');

  try {
    const { getSupabaseAdminClient } = await import('../lib/supabase/client');
    const supabase = getSupabaseAdminClient();
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'leapy')
      .single();
    if (!org) {
      console.error(
        "Organização 'Leapy' não encontrada. Execute o seed primeiro."
      );
      return;
    }
    const organizationId = org.id;

    // 1. Carregamento de Arquivos Locais (Document Loader & Parser)
    const docs = await loadAllDocuments();
    console.log(`📄 Arquivos lidos na Base de Conhecimento: ${docs.length}`);

    if (docs.length === 0) {
      console.log(
        'Nenhum arquivo encontrado em src/features/knowledge-base/data/.'
      );
      return;
    }

    for (const doc of docs) {
      console.log(
        `\n⚙️  Processando arquivo: ${doc.metadata?.title || doc.title} (${doc.metadata?.source || doc.source})`
      );

      // 2. Chunking
      const chunks = chunkDocument(doc);
      console.log(`  🧩 Dividido em ${chunks.length} chunks.`);

      if (chunks.length === 0) continue;

      // 3. Geração de Embeddings (via Vercel AI SDK e OpenAI)
      console.log(
        `  🧠 Gerando embeddings para os chunks (modelo: text-embedding-3-small)...`
      );
      const textsToEmbed = chunks.map((c) => c.content);
      const embeddings =
        await embeddingService.generateEmbeddings(textsToEmbed);

      // 4. Mapeamento para o formato do Banco de Dados
      const vectorChunks: VectorDocumentChunk[] = chunks.map(
        (chunk, index) => ({
          id: chunk.id,
          document_id: chunk.documentId,
          organization_id: organizationId,
          content: chunk.content,
          metadata: chunk.metadata,
          embedding: embeddings[index],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      );

      // 5. Inserção / Prevenção de Duplicidade (Vector DB)
      console.log(
        `  💾 Inserindo no banco de dados (limpando versões antigas do mesmo arquivo)...`
      );
      await vectorDBService.upsertChunks(vectorChunks);

      console.log(
        `  ✅ Documento '${doc.metadata?.title || doc.title}' indexado com sucesso.`
      );
    }

    console.log('\n🎉 Pipeline de Ingestão finalizado com sucesso!');
  } catch (error) {
    console.error('\n❌ Falha crítica no pipeline de ingestão:', error);
    process.exit(1);
  }
}

// Inicializa
runIngestion();
