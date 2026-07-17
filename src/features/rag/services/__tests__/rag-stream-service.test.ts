import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ragStreamService } from '../rag-stream-service';
import { retrievalService } from '../retrieval';
import { llmService } from '@/features/ai/services/llm-service';
import { RetrievalError, LLMError } from '../../errors';

vi.mock('../retrieval', () => ({
  retrievalService: {
    retrieveContext: vi.fn(),
  },
}));

vi.mock('@/features/ai/services/llm-service', () => ({
  llmService: {
    streamObject: vi.fn(),
  },
}));

describe('RagStreamService', () => {
  const mockOrgId = 'org-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return default response if question is empty', async () => {
    const response = await ragStreamService.generateStreamResponse({
      question: '',
      organizationId: mockOrgId,
    });
    expect(response.stream).toBeNull();
    expect(response.hasContext).toBe(false);
  });

  it('should return no context response if retrieval returns empty', async () => {
    vi.mocked(retrievalService.retrieveContext).mockResolvedValueOnce([]);

    const response = await ragStreamService.generateStreamResponse({
      question: 'hello',
      organizationId: mockOrgId,
    });
    expect(response.stream).toBeNull();
    expect(response.hasContext).toBe(false);
  });

  it('should throw RetrievalError if retrieval fails', async () => {
    vi.mocked(retrievalService.retrieveContext).mockRejectedValueOnce(
      new Error('DB error')
    );

    await expect(
      ragStreamService.generateStreamResponse({
        question: 'hello',
        organizationId: mockOrgId,
      })
    ).rejects.toThrow(RetrievalError);
  });

  it('should throw LLMError if llm stream generation fails', async () => {
    vi.mocked(retrievalService.retrieveContext).mockResolvedValueOnce([
      {
        id: '1',
        content: 'chunk',
        similarity: 0.9,
        metadata: { title: 'doc', source: 'doc.pdf' },
      },
    ]);
    vi.mocked(llmService.streamObject).mockRejectedValueOnce(
      new Error('LLM fail')
    );

    await expect(
      ragStreamService.generateStreamResponse({
        question: 'hello',
        organizationId: mockOrgId,
      })
    ).rejects.toThrow(LLMError);
  });

  it('should successfully generate stream response and return sources', async () => {
    const mockChunks = [
      {
        id: '1',
        content: 'chunk 1',
        similarity: 0.9,
        metadata: { title: 'doc 1', source: 'doc1.pdf', chunkIndex: 1 },
      },
      {
        id: '2',
        content: 'chunk 2',
        similarity: 0.7,
        metadata: { title: 'doc 2', source: 'doc2.pdf', chunkIndex: 2 },
      },
    ];
    vi.mocked(retrievalService.retrieveContext).mockResolvedValueOnce(
      mockChunks
    );
    const mockStream = {
      async *[Symbol.asyncIterator]() {
        yield { answer: 'a' };
      },
    };
    vi.mocked(llmService.streamObject).mockResolvedValueOnce(
      mockStream as never
    );

    const response = await ragStreamService.generateStreamResponse({
      question: 'hello',
      organizationId: mockOrgId,
    });
    expect(response.stream).toBe(mockStream);
    expect(response.hasContext).toBe(true);
    expect(response.retrievalScore).toBe(0.8);
    expect(response.sources).toHaveLength(2);
    expect(response.sources[0].source).toBe('doc1.pdf');
    expect(response.sources[0].content).toBe('chunk 1');
  });
});
