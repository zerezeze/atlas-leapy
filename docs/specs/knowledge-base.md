# Base de Conhecimento (Knowledge Base)

## Objetivo

Resolver a necessidade de extrair, ler e estruturar a fonte de verdade do projeto (arquivos locais em Markdown) para que ela possa ser consumida de maneira programática nos passos seguintes do pipeline do RAG (Retrieval-Augmented Generation).

## Contexto

A Base de Conhecimento representa a primeira etapa fundamental do processo de Ingestão (Load). É uma camada puramente backend isolada em `src/features/knowledge-base`, que provê a ponte inicial entre os arquivos físicos brutos e as lógicas de aplicação do Atlas.

## Fluxo

1. O orquestrador (ou rotina externa) invoca a camada `loadAllDocuments`.
2. O serviço `document-loader` varre e lê o conteúdo de todos os arquivos no diretório de destino (ex: `data/`).
3. Para cada arquivo, o `markdown-parser` realiza uma varredura lexical simples para extrair o título (`H1`) e injetar metadados.
4. O módulo retorna uma lista completa de objetos rigidamente tipados pelo contrato `KnowledgeDocument`.

## Requisitos funcionais

- Ler de forma assíncrona arquivos Markdown a partir de um diretório.
- Processar os textos de forma inalterada.
- Extrair títulos baseados nativamente em marcações Markdown (ex: `# Título`).
- Preservar na estrutura final o nome original do arquivo (propriedade `source`), crucial para a visualização da interface pelo usuário.

## Requisitos técnicos

- Construído utilizando bibliotecas nativas e seguras do ecossistema Node (`fs/promises`, `path`, `crypto`).
- Tipagem estrita de contratos via TypeScript (`KnowledgeDocument`, `DocumentMetadata`).
- Compatível e desenhado para suportar _Server Components_ e _Server Actions_ do paradigma Next.js App Router (15+).

## Decisões tomadas

- **Desacoplamento Intencional entre Loader e Parser:** A separação arquitetural da leitura do disco e da análise de linguagem garante que a inserção futura de novos parsers (ex: leitura de CSVs ou PDFs para Customer Success) possa ocorrer sem reescrever as lógicas de I/O de disco.
- **Isolamento de Origem:** A extração do `fs` garante que, num futuro de escala, quando migrarmos de repositório local para um Google Cloud Storage ou AWS S3, as alterações sejam totalmente limitadas ao `document-loader`.

## Fora de escopo

- Parsing estruturado de documentos avançados como arquivos nativos de Word (`.docx`), PDFs escaneados ou extração complexa de imagens internas nos Markdowns.
- Processamento contínuo em tempo real (ex: disparos ou Webhooks sincronizando automaticamente alterações feitas no Notion da Leapy em tempo real).

## Critérios de aceitação

- O serviço consegue processar todos os documentos do diretório alvo iterativamente, retornar uma lista unificada de arrays `KnowledgeDocument` devidamente preenchida e validada sem erros de travamento na aplicação.
