# Especificação: Supabase Schema & Vector Store

## Objetivo

Definir a estrutura do banco de dados relacional e vetorial no Supabase para armazenar a base de conhecimento do Atlas, permitindo buscas semânticas ultrarrápidas e integradas à nossa arquitetura RAG (Retrieval-Augmented Generation).

## Contexto

O Atlas depende de um banco de dados vetorial para executar a etapa de "Retrieval". A tabela definida nesta documentação atua como o destino final dos dados extraídos pelo `document-loader.ts` e vetorizados no `ingest.ts`, servindo como a "memória de longo prazo" do sistema.

## Tabela de Chunks Vetoriais

**Nome da tabela:** `knowledge_chunks`

### Campos e Tipos PostgreSQL

A tabela adota a seguinte estrutura estrita:

- `id` (`text`): Chave primária. Identificador único do chunk (geralmente baseado em um hash determinístico do conteúdo ou UUID).
- `document_id` (`text`): Referência lógica ao arquivo original (ex: hash do nome do arquivo). Permite agrupar os chunks.
- `content` (`text`): O conteúdo textual bruto do chunk, que será injetado no System Prompt do LLM.
- `metadata` (`jsonb`): Dados tabulares flexíveis atrelados ao chunk. Armazena obrigatoriamente `title`, `source` (caminho do arquivo) e `chunkIndex`.
- `embedding` (`vector(1536)`): A representação matemática (matriz de floats) do texto contido no chunk.
- `created_at` (`timestamptz`): Timestamp automático de criação.
- `updated_at` (`timestamptz`): Timestamp de última modificação.

## Requisitos Técnicos do Vector Store

### Configuração pgvector e Dimensão do Embedding

O Supabase deve ter a extensão `pgvector` ativa. A coluna `embedding` é fixada na dimensão `vector(1536)`. Isso garante total interoperabilidade com o modelo de IA escolhido, o `text-embedding-3-small` da OpenAI, que nativamente expele embeddings com exatas 1536 dimensões.

### Índice de Similaridade

A busca vetorial do Atlas utiliza o cálculo de **Distância do Cosseno** (Cosine Similarity - Operador `<=>` no Postgres).
Para viabilizar as consultas via SDK JavaScript, utilizamos uma Stored Procedure (RPC) customizada que recebe o vetor da pergunta do usuário, um _match_threshold_ (limiar de certeza) e um _match_count_ (limite K), filtrando e ordenando os registros matematicamente mais próximos à pergunta.

## Fluxo de Ingestão e Upsert

### Relacionamento com document-loader e ingest.ts

O ciclo de vida dos dados é orquestrado pelo `ingest.ts`. Ele utiliza o `document-loader.ts` para ler iterativamente os Markdowns do sistema de arquivos e aplica o Chunking.

### Estratégia de Inserção/Upsert

Como o Atlas lê arquivos estáticos `.md`, pequenas atualizações de texto nos documentos poderiam gerar chunks fantasmas se fizéssemos um upsert bruto baseado no texto.
A estratégia adotada é de **Substituição por Documento (Clean-then-Insert)**:

1. O pipeline deleta do banco _todos_ os chunks associados a um determinado `document_id`.
2. Em sequência, realiza o insert maciço (`upsert`) dos novos chunks re-gerados.
   Isso garante prevenção 100% contra duplicidade e orfandade de dados velhos.

## Estratégia Futura para Multi-Tenant

Embora o Atlas inicie como um banco unificado, o schema está projetado para evoluir para ambientes Multi-Tenant (ex: SaaS para múltiplos clientes):

1. Adoção de uma nova coluna `tenant_id` (`uuid`).
2. Implementação de RLS (Row Level Security) atrelando o `tenant_id` ao token JWT da request do cliente (`auth.uid()`).
3. Adaptação do RPC de Similaridade de Cosseno para sempre inserir a cláusula restritiva: `WHERE tenant_id = v_tenant_id`, separando completamente os escopos vetoriais.

## Segurança das Credenciais Supabase

A comunicação com o banco ocorre sob rígidos padrões de segurança:

- **RLS Ativada:** A tabela será blindada contra acessos anônimos do mundo externo.
- **Service Role Key Exclusiva:** O Frontend do Atlas (Navegador do Usuário) **jamais** interage com o Supabase. Toda inserção (`ingest.ts`) e recuperação (`RagService`) ocorre via servidor Node/Next.js, onde injetamos de forma invisível a `SUPABASE_SERVICE_ROLE_KEY`. Isso permite ao nosso motor transpor o RLS com poder de administrador, sem nunca expor chaves públicas aos clientes finais.
