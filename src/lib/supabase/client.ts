import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

/**
 * Cria uma instância do cliente Supabase usando a Service Role Key.
 * ATENÇÃO: Esta chave deve ser usada APENAS no servidor (Server Components/Actions),
 * pois ela bypassa as políticas de segurança (RLS) do Supabase, o que é ideal
 * para um microserviço interno de RAG ingerindo e consultando vetores globalmente.
 */
export function getSupabaseAdminClient() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'As variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias para inicializar o cliente do banco.'
    );
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false, // Não precisamos de persistência de sessão para o cliente Admin/Server
    },
  });
}
