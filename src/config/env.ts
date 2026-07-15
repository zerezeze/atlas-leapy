import { z } from 'zod';

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY é obrigatória.'),
  SUPABASE_URL: z.string().url('SUPABASE_URL deve ser uma URL válida.'),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'SUPABASE_SERVICE_ROLE_KEY é obrigatória.'),
  // Variáveis antigas para fallback caso precise
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  DEFAULT_AI_PROVIDER: z
    .enum(['openai', 'anthropic', 'google'])
    .default('openai'),
});

// Acessamos de forma segura. Caso as variáveis não existam no ambiente,
// não estouramos o build estático imediatamente, mas lançamos erro
// no runtime quando elas forem de fato requeridas pelas functions.
// Obs: Zod valida as strings no momento do parsing.
export const env = envSchema.parse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'dummy_key_for_build',
  SUPABASE_URL:
    process.env.SUPABASE_URL || 'https://dummy-url-for-build.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY:
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key_for_build',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  DEFAULT_AI_PROVIDER: process.env.DEFAULT_AI_PROVIDER,
});
