'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { chatService } from '../services/chat-service';
import { Compass, Sparkles, RefreshCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RagResponsePayload } from '@/features/rag/schemas/rag-response-schema';

const generateId = () => Date.now().toString();

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: 'streaming' | 'completed' | 'error';
  sources?: RagResponsePayload['sources'];
  retrievalScore?: number;
  explanation?: string;
}

interface ChatContainerProps {
  initialConversationId?: string;
  initialMessages?: Message[];
  documentCount?: number;
  organizationSlug?: string;
}

export function ChatContainer({
  initialConversationId,
  initialMessages = [],
  documentCount = 0,
  organizationSlug = '',
}: ChatContainerProps) {
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      status: 'completed',
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    const assistantMsgId = generateId() + '-assistant';
    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      status: 'streaming',
    };

    setMessages((prev) => [...prev, initialAssistantMsg]);

    try {
      // Consome o backend RAG utilizando Streaming
      const finalResponse = await chatService.streamMessage(
        text,
        (partial) => {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === assistantMsgId) {
                return {
                  ...msg,
                  content: partial.answer || msg.content,
                  explanation: partial.explanation || msg.explanation,
                  sources: partial.sources || msg.sources,
                  retrievalScore: partial.retrievalScore || msg.retrievalScore,
                };
              }
              return msg;
            })
          );
        },
        conversationId
      );

      // Update local conversationId if it was newly created
      if (finalResponse.conversationId && !conversationId) {
        setConversationId(finalResponse.conversationId);
        // Replace URL without full page reload
        router.replace(`/c/${finalResponse.conversationId}`);
      }

      // Finaliza a mensagem
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === assistantMsgId) {
            return {
              ...msg,
              content: finalResponse.answer,
              explanation: finalResponse.explanation,
              sources: finalResponse.sources,
              retrievalScore: finalResponse.retrievalScore,
              status: 'completed',
            };
          }
          return msg;
        })
      );
    } catch (err: unknown) {
      console.error('Erro na comunicação com o backend RAG:', err);
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === assistantMsgId) {
            return {
              ...msg,
              status: 'error',
              content:
                'Não consegui processar sua solicitação no momento. Tente novamente em alguns instantes.',
            };
          }
          return msg;
        })
      );
      setError(
        'Não consegui processar sua solicitação no momento. Tente novamente em alguns instantes.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    // Find the last user message
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'user');
    if (lastUserMessage) {
      // Remove the error message and the error state
      setMessages((prev) => prev.filter((msg) => msg.status !== 'error'));
      setError(null);
      handleSendMessage(lastUserMessage.content);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50 dark:bg-zinc-950">
      <div className="flex-1 px-4 pt-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full flex flex-col pb-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center mt-12 mb-16 gap-6 animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <Compass className="w-8 h-8 -rotate-3" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Olá, sou o Atlas 👋
                </h1>
                <p className="text-[15px] text-muted-foreground max-w-md leading-relaxed mx-auto">
                  Seu assistente inteligente de Customer Success.
                  <br />
                  {documentCount === 0
                    ? 'Faça o upload do primeiro documento na Knowledge Base para começar a usar a Inteligência Artificial.'
                    : 'Posso ajudar com informações baseadas na sua documentação institucional.'}
                </p>
              </div>

              {documentCount === 0 && (
                <div className="mt-4 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300 max-w-md text-sm font-medium">
                  Esta organização ainda não possui uma base de conhecimento.
                  Faça upload do primeiro documento na Knowledge Base para
                  começar.
                </div>
              )}

              {documentCount > 0 && organizationSlug === 'leapy' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 w-full max-w-2xl text-left">
                  {[
                    'Como funciona o cancelamento Enterprise?',
                    'Quais integrações existem atualmente?',
                    'Qual é o processo de onboarding de novos clientes?',
                    'Como funciona o fluxo de devolução financeira?',
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(suggestion)}
                      className="flex items-start gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors shadow-sm text-left group"
                    >
                      <Sparkles className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {suggestion}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              status={msg.status}
              sources={msg.sources}
              retrievalScore={msg.retrievalScore}
              explanation={msg.explanation}
            />
          ))}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex w-full justify-start mb-6 animate-in fade-in duration-300">
              <div className="flex gap-4 max-w-[85%] flex-row">
                <div className="h-8 w-8 mt-1 shrink-0 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                  <Compass className="h-4 w-4 text-zinc-400 animate-pulse" />
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-3 shadow-sm">
                  <Search className="h-4 w-4 text-blue-500 animate-pulse" />
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Consultando base de conhecimento...
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center gap-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-5 text-center my-4 font-medium animate-in fade-in slide-in-from-bottom-2">
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTryAgain}
                className="mt-1 bg-white dark:bg-zinc-950 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 transition-colors"
              >
                <RefreshCcw className="mr-2 h-3 w-3" />
                Tentar Novamente
              </Button>
            </div>
          )}

          <div ref={bottomRef} className="h-4 shrink-0" />
        </div>
      </div>

      {/* Input container at the bottom */}
      <div className="shrink-0 w-full bg-zinc-50 dark:bg-zinc-950 pt-2 pb-6 px-4">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        <p className="text-center text-xs text-muted-foreground mt-3 font-medium">
          O Atlas pode cometer erros. Sempre verifique as fontes fornecidas.
        </p>
      </div>
    </div>
  );
}
