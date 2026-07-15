'use server';

import { createStreamableValue } from '@ai-sdk/rsc';
import { documentService } from '../services/document-service';
import { DocumentChunker } from '../services/document-chunker';
import { embeddingService } from '@/features/ai/services/embedding-service';
import { vectorDBService } from '@/features/vector-store/services/vector-db';
import { VectorDocumentChunk } from '@/features/vector-store/types';

import { auth } from '@/auth';

export type UploadState =
  | 'idle'
  | 'uploading'
  | 'chunking'
  | 'embedding'
  | 'indexing'
  | 'success'
  | 'error';

export async function uploadDocumentAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Não autorizado.');
  }

  const stream = createStreamableValue<UploadState>('uploading');

  const file = formData.get('file') as File | null;
  if (!file) {
    stream.update('error');
    stream.done();
    throw new Error('Nenhum arquivo enviado.');
  }

  const organizationId = session.user.organizationId;

  // Permite que o processo rode assíncronamente sem prender a requisição principal do servidor
  // caso o Next.js aborte a action.
  (async () => {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());

      // 1. Catálogo
      stream.update('uploading');
      const doc = await documentService.createDocument(
        file.name,
        file.type || 'text/plain',
        file.size,
        organizationId
      );

      // 2. Chunking
      stream.update('chunking');
      const parsedChunks = await DocumentChunker.process(
        buffer,
        file.name,
        file.type || 'text/plain'
      );

      if (parsedChunks.length === 0) {
        throw new Error('Nenhum conteúdo válido extraído do documento.');
      }

      // 3. Embedding
      stream.update('embedding');
      const contents = parsedChunks.map((c) => c.content);
      const embeddings = await embeddingService.generateEmbeddings(contents);

      if (embeddings.length !== parsedChunks.length) {
        throw new Error('Incompatibilidade na geração de embeddings.');
      }

      // Prepara os dados para o pgvector
      const now = new Date().toISOString();
      const vectorChunks: VectorDocumentChunk[] = parsedChunks.map(
        (chunk, i) => ({
          id: `${doc.id}-chunk-${i}`,
          document_id: doc.id,
          organization_id: organizationId,
          content: chunk.content,
          metadata: chunk.metadata,
          embedding: embeddings[i],
          created_at: now,
          updated_at: now,
        })
      );

      // 4. Indexação (Upsert)
      stream.update('indexing');
      await vectorDBService.upsertChunks(vectorChunks);

      stream.update('success');
      stream.done();
    } catch (error) {
      console.error('[UploadAction] Falha no processamento:', error);
      stream.update('error');
      stream.done();
    }
  })();

  return { statusStream: stream.value };
}
