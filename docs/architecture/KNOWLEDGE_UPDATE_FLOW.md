# Fluxo de Atualização da Base de Conhecimento (Ingestão)

Este documento detalha o processo para inserir, editar ou remover conhecimentos do cérebro (RAG) do Atlas.

## Onde os arquivos vivem?

Toda a base de conhecimento oficial fica armazenada na pasta local:
`src/features/knowledge-base/data/`

Os arquivos devem estar **obrigatoriamente** em formato `.md` (Markdown). É permitido o uso de subdiretórios (ex: `/clientes`, `/financeiro`) para organização visual, já que o sistema varre tudo recursivamente.

## Passo 1: Como Adicionar ou Editar um Documento

1. Crie um novo arquivo `.md` ou edite um já existente.
2. Escreva o conteúdo utilizando formatação rica (títulos `#`, listas, negritos). O motor RAG se beneficia muito de estruturas bem definidas.
3. Salve o arquivo.

## Passo 2: Executando a Ingestão

Com a base de dados Postgres (Supabase) rodando e as variáveis de ambiente setadas (`OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`), execute o script de ingestão no terminal:

```bash
pnpm dlx tsx src/scripts/ingest.ts
```

## O que acontece por debaixo dos panos?

1. **Document Loader:** Varre a pasta recursivamente lendo os Markdowns e convertendo-os para `KnowledgeDocument`.
2. **Chunking:** O arquivo é cortado logicamente (por parágrafos ou tamanho limite).
3. **Embeddings:** Os chunks são enviados à OpenAI (`text-embedding-3-small`) para serem vetorizados (transformados em arrays de 1536 floats).
4. **Vector Store:** O sistema faz um `UPSERT` (Atualiza se existir, cria se for novo) na tabela `knowledge_chunks` do Supabase. Chunks antigos órfãos daquele documento são deletados na transação para evitar duplicidade.

## Quando o Atlas passa a responder com a nova informação?

**Imediatamente.**
Como a persistência é feita via embeddings num banco relacional vetorizado, no exato milissegundo que o script finaliza a injeção, qualquer usuário consultando o frontend do Atlas receberá as respostas baseadas no documento atualizado, sem necessidade de re-treinamento de LLM ou build do servidor.
