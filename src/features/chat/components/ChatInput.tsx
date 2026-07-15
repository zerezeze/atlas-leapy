'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal, Loader2 } from 'lucide-react';
import { useState, useRef, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto flex flex-col bg-background border rounded-2xl shadow-sm focus-within:ring-1 focus-within:ring-zinc-300 dark:focus-within:ring-zinc-700 transition-shadow">
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Faça uma pergunta sobre a Leapy..."
        className="min-h-[56px] max-h-48 resize-none border-0 p-4 shadow-none focus-visible:ring-0 text-[15px] bg-transparent flex-1 rounded-2xl"
        rows={1}
        disabled={isLoading}
      />
      <div className="flex justify-between items-center px-3 pb-3 pt-1">
        <div className="text-xs text-muted-foreground ml-2">
          Use Shift + Enter para quebra de linha
        </div>
        <Button
          size="icon"
          className="h-9 w-9 shrink-0 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 transition-colors"
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
