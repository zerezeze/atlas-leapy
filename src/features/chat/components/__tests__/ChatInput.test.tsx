import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ChatInput } from '../ChatInput';

describe('ChatInput', () => {
  it('should render correctly', () => {
    const onSendMessage = vi.fn();
    render(<ChatInput onSendMessage={onSendMessage} />);

    expect(
      screen.getByPlaceholderText('Faça uma pergunta sobre a Leapy...')
    ).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should disable button when input is empty', () => {
    const onSendMessage = vi.fn();
    render(<ChatInput onSendMessage={onSendMessage} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should enable button when input has text', async () => {
    const user = userEvent.setup();
    const onSendMessage = vi.fn();
    render(<ChatInput onSendMessage={onSendMessage} />);

    const input = screen.getByPlaceholderText(
      'Faça uma pergunta sobre a Leapy...'
    );
    await user.type(input, 'Hello Atlas');

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('should call onSendMessage when button is clicked', async () => {
    const user = userEvent.setup();
    const onSendMessage = vi.fn();
    render(<ChatInput onSendMessage={onSendMessage} />);

    const input = screen.getByPlaceholderText(
      'Faça uma pergunta sobre a Leapy...'
    );
    await user.type(input, 'Hello Atlas');

    const button = screen.getByRole('button');
    await user.click(button);

    expect(onSendMessage).toHaveBeenCalledWith('Hello Atlas');
    expect(input).toHaveValue(''); // should clear
  });

  it('should call onSendMessage when Enter is pressed without Shift', async () => {
    const user = userEvent.setup();
    const onSendMessage = vi.fn();
    render(<ChatInput onSendMessage={onSendMessage} />);

    const input = screen.getByPlaceholderText(
      'Faça uma pergunta sobre a Leapy...'
    );
    await user.type(input, 'Hello Atlas{Enter}');

    expect(onSendMessage).toHaveBeenCalledWith('Hello Atlas');
  });

  it('should not call onSendMessage when Shift+Enter is pressed', async () => {
    const user = userEvent.setup();
    const onSendMessage = vi.fn();
    render(<ChatInput onSendMessage={onSendMessage} />);

    const input = screen.getByPlaceholderText(
      'Faça uma pergunta sobre a Leapy...'
    );
    await user.type(input, 'Hello Atlas{Shift>}{Enter}{/Shift}');

    expect(onSendMessage).not.toHaveBeenCalled();
    expect(input).toHaveValue('Hello Atlas\n');
  });

  it('should not call onSendMessage when input is empty string with spaces', async () => {
    const user = userEvent.setup();
    const onSendMessage = vi.fn();
    render(<ChatInput onSendMessage={onSendMessage} />);

    const input = screen.getByPlaceholderText(
      'Faça uma pergunta sobre a Leapy...'
    );
    await user.type(input, '   {Enter}');

    expect(onSendMessage).not.toHaveBeenCalled();
  });

  it('should disable input and button when isLoading is true', () => {
    const onSendMessage = vi.fn();
    render(<ChatInput onSendMessage={onSendMessage} isLoading={true} />);

    const input = screen.getByPlaceholderText(
      'Faça uma pergunta sobre a Leapy...'
    );
    const button = screen.getByRole('button');

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });
});
