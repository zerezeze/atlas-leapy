-- 1. Cria a tabela de organizações
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.organizations enable row level security;

create policy "Permitir acesso total apenas via service_role em organizations"
on public.organizations
to service_role
using (true)
with check (true);

-- 2. Adiciona organization_id na tabela de usuários
alter table public.users add column if not exists organization_id uuid references public.organizations(id);

-- 3. Adiciona organization_id na tabela de conversas
alter table public.conversations add column if not exists organization_id uuid references public.organizations(id);

-- 4. Adiciona organization_id na tabela de documentos
alter table public.documents add column if not exists organization_id uuid references public.organizations(id);

-- 5. Adiciona organization_id na tabela knowledge_chunks
alter table public.knowledge_chunks add column if not exists organization_id uuid references public.organizations(id);

-- 6. Recria a função de busca vetorial (match_chunks) para exigir organization_id
drop function if exists match_chunks(extensions.vector, float, int);

set search_path = public, extensions;

create or replace function match_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_organization_id uuid
)
returns table (
  id text,
  document_id text,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    knowledge_chunks.id,
    knowledge_chunks.document_id,
    knowledge_chunks.content,
    knowledge_chunks.metadata,
    1 - (knowledge_chunks.embedding <=> query_embedding) as similarity
  from knowledge_chunks
  where 1 - (knowledge_chunks.embedding <=> query_embedding) > match_threshold
    and knowledge_chunks.organization_id = p_organization_id
  order by knowledge_chunks.embedding <=> query_embedding
  limit match_count;
$$;
