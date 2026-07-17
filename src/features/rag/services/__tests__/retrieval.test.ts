import { describe, it, expect, vi, beforeEach } from 'vitest';
import { retrievalService } from '../retrieval';
import { embeddingService } from '@/features/ai/services/embedding-service';
import { vectorDBService } from '@/features/vector-store/services/vector-db';

vi.mock('@/features/ai/services/embedding-service', () => ({
  embeddingService: {
    generateEmbeddings: vi.fn(),
  },
}));

vi.mock('@/features/vector-store/services/vector-db', () => ({
  vectorDBService: {
    searchChunks: vi.fn(),
  },
}));

describe('RetrievalService', () => {
  const organizationId = 'org-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array if question is empty', async () => {
    const result = await retrievalService.retrieveContext('', organizationId);
    expect(result).toEqual([]);
    expect(embeddingService.generateEmbeddings).not.toHaveBeenCalled();
  });

  it('should return empty array if question is just whitespace', async () => {
    const result = await retrievalService.retrieveContext(
      '   ',
      organizationId
    );
    expect(result).toEqual([]);
    expect(embeddingService.generateEmbeddings).not.toHaveBeenCalled();
  });

  it('should throw if embedding generation fails to return vectors', async () => {
    vi.mocked(embeddingService.generateEmbeddings).mockResolvedValueOnce([]);

    await expect(
      retrievalService.retrieveContext('test question', organizationId)
    ).rejects.toThrow('Não foi possível gerar embedding para a pergunta.');
  });

  it('should retrieve context successfully', async () => {
    const mockEmbedding = [0.1, 0.2, 0.3];
    const mockResults = [
      { id: '1', content: 'chunk 1', similarity: 0.9 },
      { id: '2', content: 'chunk 2', similarity: 0.8 },
    ];

    vi.mocked(embeddingService.generateEmbeddings).mockResolvedValueOnce([
      mockEmbedding,
    ]);
    vi.mocked(vectorDBService.searchChunks).mockResolvedValueOnce(
      mockResults as never
    );

    const results = await retrievalService.retrieveContext(
      'test question',
      organizationId,
      5
    );

    expect(embeddingService.generateEmbeddings).toHaveBeenCalledWith([
      'test question',
    ]);
    expect(vectorDBService.searchChunks).toHaveBeenCalledWith(
      mockEmbedding,
      organizationId,
      5,
      0.5
    );
    expect(results).toEqual(mockResults);
  });
});
