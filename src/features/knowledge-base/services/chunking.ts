import { KnowledgeDocument, DocumentChunk } from '../types';
import crypto from 'crypto';

interface ChunkingOptions {
  maxLength: number;
}

/**
 * Divide um documento em pedaços menores (chunks) para futura vetorização.
 *
 * Estratégia do MVP:
 * Chunking baseado em limites de parágrafo (duas quebras de linha).
 * O algoritmo agrupa parágrafos até atingir um `maxLength` aproximado.
 * Essa abordagem é simples, rápida e preserva o contexto semântico básico
 * do autor, evitando cortes no meio de frases ou palavras.
 */
export function chunkDocument(
  document: KnowledgeDocument,
  options: ChunkingOptions = { maxLength: 800 }
): DocumentChunk[] {
  // Quebra inicial segura: duplo "enter" costuma separar parágrafos em Markdown
  const paragraphs = document.content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: DocumentChunk[] = [];
  let currentChunkText = '';
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    // Se agrupar ultrapassar o limite (e já tivermos texto acumulado), fechamos o chunk atual
    if (
      currentChunkText.length + paragraph.length > options.maxLength &&
      currentChunkText.length > 0
    ) {
      chunks.push(createChunk(document, currentChunkText, chunkIndex++));
      currentChunkText = paragraph; // O parágrafo atual inicia o próximo chunk
    } else {
      // Concatena com o texto atual usando a mesma quebra
      currentChunkText = currentChunkText
        ? `${currentChunkText}\n\n${paragraph}`
        : paragraph;
    }
  }

  // Push do chunk final remanescente, se existir
  if (currentChunkText.length > 0) {
    chunks.push(createChunk(document, currentChunkText, chunkIndex++));
  }

  return chunks;
}

function createChunk(
  document: KnowledgeDocument,
  text: string,
  index: number
): DocumentChunk {
  // Garante um ID único e idempotente baseado no documento pai e na posição
  const chunkId = crypto
    .createHash('sha256')
    .update(`${document.id}-chunk-${index}`)
    .digest('hex');

  return {
    id: chunkId,
    documentId: document.id,
    content: text,
    metadata: {
      source: (document.metadata?.source as string) || document.source,
      title: (document.metadata?.title as string) || document.title,
      chunkIndex: index,
    },
  };
}
