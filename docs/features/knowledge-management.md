# Gestão da Base de Conhecimento (Sprint 14)

A Base de Conhecimento do Atlas evoluiu para ser gerenciável pela própria interface gráfica. Administradores podem realizar o upload e a remoção de documentos de referência que o LLM utilizará.

## Como funciona o Upload (Ingestão)

1. **Catálogo**: Quando um arquivo é enviado via `UploadZone`, ele primeiramente é registrado na tabela `documents`. Isso serve estritamente como um índice de governança (ID, nome do arquivo, metadados de tamanho).
2. **Chunking**: O arquivo não é salvo cru no banco de dados. Ele passa pelo `DocumentChunker`, que utiliza uma estratégia baseada na extensão (`MarkdownParser` ou `TextParser`) para dividir o texto original em pequenos "blocos" de informação (chunks).
3. **Embeddings**: Todos os chunks extraídos são mapeados para a API de Embeddings da OpenAI. Ela nos retorna uma representação matemática vetorial multidimensional do texto.
4. **Armazenamento no Vector Database**: Por fim, os blocos de texto, junto a seus vetores gerados e o `document_id` que os referencia, são salvos na tabela `knowledge_chunks`. O recurso pgvector indexa esses vetores com o algoritmo HNSW.

## Como funciona a Exclusão (Remoção de Índices)

Quando um documento é excluído do catálogo (tabela `documents`), todos os `knowledge_chunks` pertencentes àquele documento são automaticamente expurgados (via query onde `document_id` bate com o documento deletado).
Isso garante que informações obsoletas saiam imediatamente do motor de busca do RAG e da geração de respostas do assistente, impedindo a existência de "chunks órfãos".

## Vantagens dessa Arquitetura

- **Sem re-arquitetura**: O fluxo existente de RAG (`retrieval`, `vector-db`, `embedding`) foi inteiramente reutilizado na ingestão de novos documentos.
- **Preparado para o Futuro**: Adicionar suporte a PDF/DOCX futuramente requer apenas criar um novo `PdfParser` ou `DocxParser` que implemente a interface de processamento e plugá-lo no `DocumentChunker`. Todo o resto da malha de upload e ingestão funcionará automaticamente.
