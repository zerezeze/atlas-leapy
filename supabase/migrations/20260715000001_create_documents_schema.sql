-- Tabela administrativa para catálogo de documentos
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  mime_type text not null,
  size bigint not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.documents enable row level security;

-- Policy restrita para service_role
create policy "Permitir acesso total apenas via service_role em documents"
on public.documents
to service_role
using (true)
with check (true);
