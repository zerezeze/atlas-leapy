import 'dotenv/config';
import { getSupabaseAdminClient } from '../lib/supabase/client';

async function runTest() {
  console.log('🔍 Iniciando teste de conexão com o Supabase...\n');

  try {
    const supabase = getSupabaseAdminClient();

    // 1. Testa a conexão básica e a existência da tabela
    console.log("⏳ Verificando conectividade e tabela 'knowledge_chunks'...");
    const { error: tableError } = await supabase
      .from('knowledge_chunks')
      .select('id')
      .limit(1);

    if (tableError) {
      throw new Error(`Falha ao acessar a tabela: ${tableError.message}`);
    }
    console.log(
      "✅ Conexão estabelecida e tabela 'knowledge_chunks' encontrada!\n"
    );

    // 2. Testa a existência da RPC (match_chunks)
    console.log("⏳ Verificando Stored Procedure 'match_chunks'...");
    // Criamos um vetor preenchido com zeros apenas para validar a assinatura da função
    const dummyVector = new Array(1536).fill(0);
    const { error: rpcError } = await supabase.rpc('match_chunks', {
      query_embedding: dummyVector,
      match_threshold: 0,
      match_count: 1,
    });

    if (rpcError) {
      throw new Error(
        `Falha ao acessar a RPC match_chunks: ${rpcError.message}`
      );
    }
    console.log(
      "✅ Função 'match_chunks' está acessível e respondendo perfeitamente!\n"
    );

    console.log(
      '🎉 TESTE BEM-SUCEDIDO! O Atlas está pronto para se conectar à infraestrutura real do Supabase.'
    );
  } catch (error: unknown) {
    console.error('\n❌ ERRO NO TESTE DE CONEXÃO:');
    console.error(error instanceof Error ? error.message : String(error));
    console.error(
      '\n👉 Dica: Verifique se as credenciais SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão corretas no arquivo .env.'
    );
    process.exit(1);
  }
}

// Executa
runTest();
