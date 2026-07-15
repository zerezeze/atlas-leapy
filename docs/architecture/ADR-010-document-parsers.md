# ADR 010: Parsers de Documentos (PDF e DOCX)

## Status

Aceito

## Contexto

Durante a evolução da plataforma Leapy (Atlas), identificou-se a necessidade de suportar formatos corporativos padrão (PDF e DOCX) para compor a base de conhecimento (Knowledge Base). No entanto, o pipeline RAG (Retrieval-Augmented Generation) já estava maduro e processando Chunks (trechos de texto) com estabilidade para arquivos Markdown e Texto Plano.

A alteração do RAG, dos serviços de Embedding ou do fluxo do VectorDB (pgvector) seria custosa e arriscada.

## Decisão

Foi decidido adotar o princípio **Open/Closed** para o processamento de arquivos:
O pipeline de chunking (orquestrador) foi fechado para modificações no seu fluxo principal de Indexação/Embedding, mas está aberto à extensão por meio da injeção de **Parsers de Formato**.

1. **pdf-parse**: Adotamos a biblioteca `pdf-parse` por sua capacidade rápida de leitura server-side de buffers binários de PDF sem necessidade de binários C++ ou conversão via OCR (para PDFs padrão baseados em texto).
2. **mammoth**: Adotamos a biblioteca `mammoth` para ler arquivos DOCX. Ela lida diretamente com os nós XML subjacentes do formato Word, provendo a extração segura do `rawText`.

Os parsers (`PdfParser` e `DocxParser`) implementam a interface `DocumentParser` definida em `types.ts`, e tudo o que eles fazem é extrair texto bruto do binário para em seguida aplicar a separação de parágrafos idêntica à que é feita em texto simples.

## Consequências

- **Positivas:**
  - O pipeline RAG não sofreu NENHUMA alteração de lógica. Ele continua recebendo um array de `ParsedChunk` idêntico a antes.
  - A interface de adição de arquivos pode ser facilmente expandida no futuro para incluir arquivos CSV, HTML ou EPUB, bastando instanciar novos parsers em `DocumentChunker`.
- **Limitações:**
  - `pdf-parse` não lê texto rasterizado (imagens escaneadas dentro de um PDF). Para OCR futuro, o serviço deverá ser trocado por uma API robusta de Visão (como Tesseract ou Google Cloud Vision).
  - Imagens dentro do DOCX são ignoradas pelo `mammoth.extractRawText()`.
