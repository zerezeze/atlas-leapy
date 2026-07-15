-- Tabela de Usuários para gerir Autenticação
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.users enable row level security;

-- Policy restrita para service_role (Backend node manipulando dados, garantindo que cliente nunca leia)
create policy "Permitir acesso total apenas via service_role em users"
on public.users
to service_role
using (true)
with check (true);
