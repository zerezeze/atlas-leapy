-- 1. Habilita a extensão pgvector para suporte a buscas vetoriais
create extension if not exists vector with schema extensions;

-- Garante que o schema extensions esteja no search_path para encontrarmos os operadores do pgvector
set search_path = public, extensions;

-- 2. Cria a tabela principal de armazenamento dos chunks e embeddings
create table if not exists public.knowledge_chunks (
  -- Chave primária: ID único do chunk (hash ou UUID gerado pelo backend)
  id text primary key,
  
  -- Referência lógica ao arquivo original (ex: caminho do arquivo)
  document_id text not null,
  
  -- O conteúdo textual real do chunk que será enviado como contexto ao LLM
  content text not null,
  
  -- Metadados flexíveis e tipados (fonte, título, posição/index, etc.)
  metadata jsonb not null default '{}'::jsonb,
  
  -- A representação matemática vetorial do texto
  -- Dimensão fixada em 1536 para interoperabilidade com OpenAI `text-embedding-3-small`
  embedding vector(1536),
  
  -- Timestamps de controle
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Cria índice HNSW para otimização extrema de performance na busca semântica
-- O operador vector_cosine_ops alinha perfeitamente com a Similaridade de Cosseno usada no Atlas
create index if not exists knowledge_chunks_embedding_idx 
  on public.knowledge_chunks 
  using hnsw (embedding vector_cosine_ops);

-- 4. Cria a Stored Procedure (RPC) para busca vetorial por Similaridade de Cosseno (<=>)
create or replace function match_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
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
  order by knowledge_chunks.embedding <=> query_embedding
  limit match_count;
$$;

-- 5. Segurança: Row Level Security (RLS)
-- Garante que a tabela seja blindada contra acessos anônimos e usuários não autorizados do frontend
alter table public.knowledge_chunks enable row level security;

-- Cria policy exclusiva para a service_role (backend) permitindo manipulação total dos vetores
drop policy if exists "Permitir acesso total apenas via service_role" on public.knowledge_chunks;
create policy "Permitir acesso total apenas via service_role"
on public.knowledge_chunks
to service_role
using (true)
with check (true);
