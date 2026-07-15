import 'dotenv/config';
import { ragService } from '../features/rag/services/rag-service';

/**
 * Script utilitário para testar ponta-a-ponta a Inteligência do RAG.
 */
async function runRagTest() {
  const query = process.argv.slice(2).join(' ');
  if (!query) {
    console.log(
      "Uso: pnpm dlx tsx src/scripts/test-rag.ts 'Sua pergunta aqui'"
    );
    console.log(
      "Ex: pnpm dlx tsx src/scripts/test-rag.ts 'Como funciona o cancelamento de assinatura?'"
    );
    process.exit(1);
  }

  console.log(
    `🧠 Iniciando fluxo RAG completo para a pergunta: "${query}"...\n`
  );

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

    const response = await ragService.generateResponse({
      question: query,
      organizationId: org.id,
    });

    console.log('\n========================================================');
    console.log('🤖 RESPOSTA (answer):\n');
    console.log(response.answer);

    console.log('\n💡 EXPLICAÇÃO (explanation):\n');
    console.log(response.explanation);

    if (response.sources.length > 0) {
      console.log('\n📚 FONTES UTILIZADAS:');
      response.sources.forEach((s) => {
        console.log(`  - ${s.title} (${s.source})`);
      });
      console.log(
        `\n📊 Retrieval Score (Relevância do Contexto): ${(response.retrievalScore * 100).toFixed(1)}%`
      );
    } else {
      console.log('\n📚 FONTES UTILIZADAS: Nenhuma');
      console.log(
        `\n📊 Retrieval Score: ${(response.retrievalScore * 100).toFixed(1)}%`
      );
    }

    console.log(
      `\n🔎 STATUS DE CONTEXTO (hasContext): ${response.hasContext ? 'Sim' : 'Não'}`
    );
    console.log('========================================================\n');
  } catch (error) {
    console.error('❌ Erro no fluxo RAG:', error);
  }
}

runRagTest();
