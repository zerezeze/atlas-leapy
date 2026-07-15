# ADR 007: Arquitetura e Ingestão de Documentos (Knowledge Management)

**Data:** 15 de Julho de 2026
**Status:** Aceito

## Contexto

O Atlas possuía um esquema robusto para RAG (Retrieval-Augmented Generation), onde a busca vetorial (pgvector) e o pipeline de embeddings operavam perfeitamente. Contudo, as informações na base de dados (chunks) foram injetadas manualmente ou via scripts SQL brutos na Sprint anterior. Precisávamos de uma interface para que usuários administrativos pudessem retroalimentar o "cérebro" do assistente a quente (on-the-fly) pelo painel sem exigir conhecimentos técnicos.

## Decisão

Optamos por estender o projeto sem tocar na lógica "Core" do RAG (Retrieve/LLM), criando apenas o pipeline de **Ingestão**.

1. **Separação de Preocupação no Banco de Dados**: Criamos a tabela `documents` separada da `knowledge_chunks`. A tabela `documents` serve unicamente como catálogo (Nome, Tamanho, Data). A tabela `knowledge_chunks` ganhou a coluna `document_id` no passado, o que casou perfeitamente. Os conteúdos dos documentos **nunca são salvos em blob ou markdown** no banco (apenas os chunks fracionados em `knowledge_chunks`), visando evitar duplicação de dados e inflar o banco em excesso.
2. **Strategy Pattern para Parsers**: Implementamos uma `DocumentParser` base com ramificações em `MarkdownParser` e `TextParser`. Qualquer novo formato de arquivo exigirá apenas a adição de um novo parser nesta pasta, sem modificar os fluxos de Server Actions.
3. **Gerenciamento de Estado sem WebSockets**: Como o pipeline de chunking, embedding e salvamento pode demorar, e Next.js/Vercel Server Actions são chamadas atômicas HTTP, usamos a biblioteca `ai/rsc` (`createStreamableValue`) nativa do projeto para fluir o estado de progresso ("Dividindo...", "Gerando embeddings...") do back-end para o front-end, sem recorrer a WebSockets, Polling agressivo ou Fake Progress Bars.
4. **Tratamento de Arquivos em Memória**: Por agora, as rotinas operam lendo o FormData e alocando um `Buffer` em memória, dado que arquivos de texto plano têm alguns poucos kilobytes. No futuro, quando a aplicação adotar PDFs extensos (>50MB), deverá ser implantado um Upload direto (Signed URL) pro S3 / Supabase Storage antes de iniciar a extração.

## Consequências

- A base de dados principal (`documents`) fica superleve.
- A UI passa percepção de velocidade sem carregar complexidade de estado assíncrono complexo no React graças ao `readStreamableValue`.
- Documentos de altíssimo tamanho e que requeiram bibliotecas C++ nativas no parser (como PDF) necessitarão de atenção na próxima revisão do chunking.
