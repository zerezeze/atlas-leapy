import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatContainer } from '../ChatContainer';
import userEvent from '@testing-library/user-event';
import { chatService } from '@/features/chat/services/chat-service';

// Mock services
vi.mock('@/features/chat/services/chat-service', () => ({
  chatService: {
    streamMessage: vi.fn(),
  },
}));

// Mock window.scrollTo and HTMLElement.scrollIntoView
window.scrollTo = vi.fn();
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('ChatContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render welcome screen if no messages', () => {
    render(<ChatContainer documentCount={1} organizationSlug="acme" />);
    expect(screen.getByText(/Olá, sou o Atlas/i)).toBeInTheDocument();
  });

  it('should render zero documents warning if documentCount is 0', () => {
    render(<ChatContainer documentCount={0} organizationSlug="acme" />);
    expect(
      screen.getByText(
        /Esta organização ainda não possui uma base de conhecimento/i
      )
    ).toBeInTheDocument();
  });

  it('should add user message and call stream service when submitted', async () => {
    const user = userEvent.setup();

    vi.mocked(chatService.streamMessage).mockImplementation(
      async (question, onUpdate) => {
        onUpdate({ answer: 'Mocked reply' });
        return {
          answer: 'Mocked reply',
          explanation: 'Because.',
          sources: [],
          retrievalScore: 1,
          hasContext: true,
          conversationId: '123',
        };
      }
    );

    render(<ChatContainer documentCount={1} organizationSlug="acme" />);

    const input = screen.getByPlaceholderText(
      'Faça uma pergunta sobre a Leapy...'
    );
    await user.type(input, 'Testing RAG{Enter}');

    // User message should appear
    expect(await screen.findByText('Testing RAG')).toBeInTheDocument();

    // Verify service was called
    await waitFor(() => {
      expect(chatService.streamMessage).toHaveBeenCalled();
    });

    // Verify assistant reply streamed in
    expect(await screen.findByText('Mocked reply')).toBeInTheDocument();
  });

  it('should display error if stream service throws', async () => {
    const user = userEvent.setup();
    vi.mocked(chatService.streamMessage).mockRejectedValueOnce(
      new Error('API failed')
    );

    render(<ChatContainer documentCount={1} organizationSlug="acme" />);

    const input = screen.getByPlaceholderText(
      'Faça uma pergunta sobre a Leapy...'
    );
    await user.type(input, 'Fail this{Enter}');

    const errors = await screen.findAllByText(
      /Não consegui processar sua solicitação/i
    );
    expect(errors.length).toBeGreaterThan(0);
  });
});
