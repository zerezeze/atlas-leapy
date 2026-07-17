import 'dotenv/config';
import { getSupabaseAdminClient } from '../lib/supabase/client';
import bcrypt from 'bcryptjs';

async function seedAcme() {
  const supabase = getSupabaseAdminClient();

  // 1. Criar a organização ACME
  console.log('Criando organização Acme...');
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .upsert(
      {
        name: 'Acme Corp',
        slug: 'acme',
      },
      { onConflict: 'slug' }
    )
    .select()
    .single();

  if (orgError) {
    console.error('Erro ao criar organização:', orgError);
    return;
  }
  console.log('Organização criada:', org.name, 'ID:', org.id);

  // 2. Criar Usuário Admin da Acme
  const email = 'admin@acme.com';
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  console.log(`Criando usuário ${email}...`);
  const { error: userError } = await supabase
    .from('users')
    .upsert(
      {
        email,
        name: 'Acme Admin',
        password_hash: passwordHash,
        organization_id: org.id,
      },
      { onConflict: 'email' }
    )
    .select()
    .single();

  if (userError) {
    console.error('Erro ao criar usuário:', userError);
    return;
  }

  console.log('Usuário Acme criado com sucesso!');
  console.log(`Email: ${email}`);
  console.log(`Senha: ${password}`);
}

seedAcme().catch(console.error);
