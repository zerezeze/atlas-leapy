import 'dotenv/config';
import { retrievalService } from '../features/rag/services/retrieval';

/**
 * Script utilitário para testar a busca vetorial diretamente via terminal,
 * simulando o que o assistente RAG fará para recuperar o contexto antes de responder.
 */
async function runSearchTest() {
  const query = process.argv.slice(2).join(' ');

  if (!query) {
    console.log(
      "Uso: pnpm dlx tsx src/scripts/test-search.ts 'Sua pergunta aqui'"
    );
    console.log(
      "Ex: pnpm dlx tsx src/scripts/test-search.ts 'Como funciona o cancelamento?'"
    );
    process.exit(1);
  }

  console.log(`🔎 Buscando contexto para: "${query}"...\n`);

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

    // Configurado para buscar os 3 resultados mais relevantes
    const results = await retrievalService.retrieveContext(query, org.id, 3);

    if (results.length === 0) {
      console.log(
        'Nenhum resultado relevante encontrado (Threshold muito alto ou base vazia).'
      );
      return;
    }

    results.forEach((res, i) => {
      console.log(
        `\n--- Resultado #${i + 1} (Similaridade: ${(res.similarity * 100).toFixed(1)}%) ---`
      );
      console.log(`Fonte: ${res.metadata.title} (${res.metadata.source})`);
      console.log(`Conteúdo:\n${res.content}`);
    });
  } catch (error) {
    console.error('❌ Erro durante a busca vetorial:', error);
  }
}

runSearchTest();
