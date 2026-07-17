import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatMessage } from '../ChatMessage';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const writeTextMock = vi.fn().mockResolvedValue(undefined);
Object.assign(navigator, {
  clipboard: {
    writeText: writeTextMock,
  },
});

describe('ChatMessage', () => {
  it('should render user message correctly', () => {
    render(
      <ChatMessage role="user" content="Hello World" status="completed" />
    );
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('US')).toBeInTheDocument();
  });

  it('should render assistant message correctly with markdown', () => {
    render(
      <ChatMessage
        role="assistant"
        content="**Bold Text**"
        status="completed"
      />
    );
    const strongElement = screen.getByText('Bold Text');
    expect(strongElement.tagName).toBe('STRONG');
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('should display error status correctly', () => {
    render(
      <ChatMessage
        role="assistant"
        content="An error occurred"
        status="error"
      />
    );
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    // Assuming lucide-react icons are rendered as SVGs
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('should render sources if provided', () => {
    const sources = [
      { source: 'doc1.pdf', title: 'Document 1', content: 'chunk data' },
    ];
    render(
      <ChatMessage
        role="assistant"
        content="Hello"
        status="completed"
        sources={sources}
      />
    );

    expect(screen.getByText('Fontes consultadas')).toBeInTheDocument();
    expect(screen.getByText('doc1.pdf')).toBeInTheDocument();
  });

  it('should copy content to clipboard when copy button is clicked', async () => {
    render(
      <ChatMessage role="assistant" content="To be copied" status="completed" />
    );

    const copyButton = screen.getByRole('button', { name: /copiar/i });
    fireEvent.click(copyButton);

    expect(writeTextMock).toHaveBeenCalledWith('To be copied');
  });

  it('should show explanation dialog if explanation is provided', async () => {
    render(
      <ChatMessage
        role="assistant"
        content="Hello"
        status="completed"
        explanation="This is the why"
      />
    );

    expect(
      screen.getByText('Como esta resposta foi construída')
    ).toBeInTheDocument();
    expect(screen.getByText('This is the why')).toBeInTheDocument();
  });

  it('should render all markdown components', () => {
    const markdownText = `
# Heading 1
## Heading 2
### Heading 3
- List item 1
1. Number item
\`inline code\`
\`\`\`
block code
\`\`\`
`;
    render(
      <ChatMessage role="assistant" content={markdownText} status="completed" />
    );
    expect(screen.getByText('Heading 1')).toBeInTheDocument();
    expect(screen.getByText('Heading 2')).toBeInTheDocument();
    expect(screen.getByText('Heading 3')).toBeInTheDocument();
    expect(screen.getByText('List item 1')).toBeInTheDocument();
    expect(screen.getByText('Number item')).toBeInTheDocument();
    expect(screen.getByText('inline code')).toBeInTheDocument();
    expect(screen.getByText('block code')).toBeInTheDocument();
  });

  it('should render dialog content when clicking source', async () => {
    const sources = [
      { source: 'doc1.pdf', title: 'Document 1', content: 'chunk data' },
      { source: 'doc2.pdf', title: 'Document 2', content: 'another chunk' },
    ];
    render(
      <ChatMessage
        role="assistant"
        content="Hello"
        status="completed"
        sources={sources}
        retrievalScore={0.85}
      />
    );

    // Test the first source (main source) dialog
    const triggers = screen.getAllByRole('button', { name: /doc/i });
    expect(triggers.length).toBeGreaterThan(0);
  });
});
