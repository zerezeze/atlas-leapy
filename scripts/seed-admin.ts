import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_ROLE_KEY ||
  !ADMIN_EMAIL ||
  !ADMIN_PASSWORD
) {
  console.error('Faltam variáveis de ambiente necessárias (.env).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  console.log(`[Seed] Configurando Multi-Tenant (Organização 'Leapy')...`);

  // 1. Criar ou buscar Organização Leapy
  let orgId: string;
  const { data: existingOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', 'leapy')
    .single();

  if (existingOrg) {
    orgId = existingOrg.id;
    console.log(`[Seed] Organização 'Leapy' já existe (ID: ${orgId}).`);
  } else {
    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: 'Leapy', slug: 'leapy' })
      .select('id')
      .single();

    if (orgError) {
      console.error(`[Seed] Erro ao criar organização:`, orgError.message);
      process.exit(1);
    }
    orgId = newOrg.id;
    console.log(`[Seed] Organização 'Leapy' criada (ID: ${orgId}).`);
  }

  // 2. Administrador
  console.log(`[Seed] Verificando existência do usuário ${ADMIN_EMAIL}...`);
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', ADMIN_EMAIL)
    .single();

  if (existingUser) {
    console.log(
      `[Seed] O usuário ${ADMIN_EMAIL} já existe. Atualizando organization_id...`
    );
    await supabase
      .from('users')
      .update({ organization_id: orgId })
      .eq('id', existingUser.id);
  } else {
    console.log(`[Seed] Gerando hash da senha...`);
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD!, 10);

    console.log(`[Seed] Criando usuário...`);
    const { error: userError } = await supabase.from('users').insert({
      name: 'Admin Leapy',
      email: ADMIN_EMAIL,
      password_hash: passwordHash,
      organization_id: orgId,
    });

    if (userError) {
      console.error(`[Seed] Falha ao criar usuário:`, userError.message);
      process.exit(1);
    }
    console.log(`[Seed] Usuário ${ADMIN_EMAIL} criado com sucesso!`);
  }

  // 3. Data Migration (Atualizar dados legados para a organização)
  console.log(`[Seed] Migrando dados antigos para a organização 'Leapy'...`);
  await supabase
    .from('users')
    .update({ organization_id: orgId })
    .is('organization_id', null);
  await supabase
    .from('conversations')
    .update({ organization_id: orgId })
    .is('organization_id', null);
  await supabase
    .from('documents')
    .update({ organization_id: orgId })
    .is('organization_id', null);
  await supabase
    .from('knowledge_chunks')
    .update({ organization_id: orgId })
    .is('organization_id', null);
  console.log(`[Seed] Migração de dados concluída!`);
}

seed().catch((err) => {
  console.error('[Seed] Erro fatal:', err);
  process.exit(1);
});
