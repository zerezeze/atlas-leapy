# Persistência Vetorial (Vector Store)

## Objetivo

Atuar como o local final (Repositório Físico) que armazena, organiza e permite o rápido resgate das porções da nossa base de conhecimento. Ele resolve a dor de persistir massas textuais integradas aos vetores matemáticos para fornecer contexto seguro aos modelos de Linguagem.

## Contexto

O componente é o fim absoluto do pipeline de Ingestão de dados e será a origem primordial (_Read_) durante o Chat Bot e orquestrações de Similaridade. Reside unicamente na camada `src/features/vector-store`.

## Fluxo

1. O Serviço de DB do backend (`VectorDBService`) inicializa o cliente restrito Administrativo e ignora o RLS padrão do Banco.
2. Um Array enorme contendo objetos da tipagem `VectorDocumentChunk` é recebido.
3. Extrai as fontes (`document_id`) e aciona um sub-comando de exclusão da tabela (para suprimir e matar chunks fantasmas provenientes de execuções anteriores do mesmo documento base).
4. Efetua a inserção definitiva do conteúdo bruto, com Embeddings 1536 gerados, na tabela relacional PostgreSQL.

## Requisitos funcionais

- Suportar gravações complexas de matrizes de números e Strings cruas longas simultaneamente (Tipos Customizados).
- Executar exclusão por documento para efetivar substituição idempotente da informação (Upsert adaptado via ID do source) evitando duplicações desastrosas para o LLM caso um arquivo seja renomeado ou readicionado.
- Indexação veloz no formato padronizado híbrido que nos ajude tanto nos metadados (como fonte e versão) como na Similaridade.

## Requisitos técnicos

- Instanciação de integração banco/servidor via `@supabase/supabase-js`.
- Utilizar obrigatoriamente Autenticação via `Service Role Key` (Bypass Server side) para manuseio estrutural do RAG em vez do token autenticado de usuário comum.
- Tabela criada utilizando a estrutura PostgreSQL estendida (`pgvector`) para armazenar os blocos formatados dimensionais da Open AI (`vector(1536)`).

## Decisões tomadas

- **Adoção do Supabase + pgvector:** Optamos por não introduzir bancos de dados geridos caríssimos ou estritamente vetoriais fragmentados (como Pinecone ou Weaviate) neste MVP. O Atlas precisará eventualmente gravar dados relacionais puros, como tabelas de Logs, Históricos de Chat, Perfis e Auth. Ao utilizarmos o Supabase com `pgvector`, consolidamos tudo numa infraestrutura enxuta, de alta aderência ao ecosistema Next.js.
- **Tipos de Coluna para Busca Futura:** Metadados como `chunkIndex` e arquivos originais salvos sob a flag de coluna `jsonb`. Essa flexibilidade no Postgres nativo irá possibilitar a inserção futura (na Ingestão avançada) de permissões por roles em JSON sem precisarmos recriar esquemas.

## Fora de escopo

- Construção agressiva de indexadores customizados em tempo de Ingestão na base como Inverted Files (IVFFlat) refinados. O HNSW e a estruturação foram definidos via arquitetura base apenas.
- Roteamento híbrido (BM25 Lexical search + Vector Search). No escopo deste RAG de base, faremos puramente recuperação densa (Vetorial pura).

## Critérios de aceitação

- Migrations puras (`.sql`) foram criadas e representam o que consta na interface de mapeamento do código (`VectorDocumentChunk`).
- O Client autêntica sob o uso de validação Zod (env var `SUPABASE_SERVICE_ROLE_KEY` e URL).
- A tabela recusa inserções que não possuam as formatações JSONB de metadata e aceita de modo resiliente o preenchimento Nulo nos Embeddings até eles passarem pela Inteligência Artificial.
