import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileText, Info, Copy, Check, AlertCircle } from 'lucide-react';
import { RagResponsePayload } from '@/features/rag/schemas/rag-response-schema';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  status: 'streaming' | 'completed' | 'error';
  sources?: RagResponsePayload['sources'];
  retrievalScore?: number;
  explanation?: string;
}

export function ChatMessage({
  role,
  content,
  status,
  sources,
  retrievalScore,
  explanation,
}: ChatMessageProps) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div
        className={`flex gap-4 max-w-[85%] w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      >
        <Avatar className="h-8 w-8 mt-1 shrink-0 shadow-sm border">
          {isUser ? (
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              US
            </AvatarFallback>
          ) : (
            <AvatarFallback className="bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold">
              A
            </AvatarFallback>
          )}
        </Avatar>

        <div
          className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'} w-full`}
        >
          <div
            className={`px-5 py-4 text-[15px] shadow-sm relative group ${
              isUser
                ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground rounded-2xl rounded-tr-sm'
                : status === 'error'
                  ? 'bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200 border border-red-200 dark:border-red-900/50 rounded-2xl rounded-tl-sm w-full'
                  : 'bg-white dark:bg-zinc-900 text-foreground border rounded-2xl rounded-tl-sm w-full'
            }`}
          >
            {status === 'error' ? (
              <div className="flex gap-2 items-center">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
              </div>
            ) : isUser ? (
              <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
            ) : (
              <div
                className={`relative leading-relaxed ${status === 'streaming' ? 'animate-pulse' : ''}`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ ...props }) => (
                      <h1 className="text-xl font-bold mt-4 mb-2" {...props} />
                    ),
                    h2: ({ ...props }) => (
                      <h2
                        className="text-lg font-semibold mt-4 mb-2"
                        {...props}
                      />
                    ),
                    h3: ({ ...props }) => (
                      <h3
                        className="text-base font-semibold mt-3 mb-2"
                        {...props}
                      />
                    ),
                    p: ({ ...props }) => (
                      <p className="mb-3 last:mb-0" {...props} />
                    ),
                    ul: ({ ...props }) => (
                      <ul
                        className="list-disc pl-5 mb-3 space-y-1"
                        {...props}
                      />
                    ),
                    ol: ({ ...props }) => (
                      <ol
                        className="list-decimal pl-5 mb-3 space-y-1"
                        {...props}
                      />
                    ),
                    li: ({ ...props }) => <li className="" {...props} />,
                    code: ({
                      inline,
                      ...props
                    }: React.HTMLAttributes<HTMLElement> & {
                      inline?: boolean;
                    }) =>
                      inline ? (
                        <code
                          className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400"
                          {...props}
                        />
                      ) : (
                        <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono border border-zinc-800">
                          <code {...props} />
                        </pre>
                      ),
                  }}
                >
                  {content || 'Pensando...'}
                </ReactMarkdown>

                {/* Botão de Copiar exibido em Hover */}
                {!isUser && status === 'completed' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-white dark:bg-zinc-900 border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleCopy}
                    title="Copiar resposta"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-zinc-500" />
                    )}
                  </Button>
                )}
              </div>
            )}

            {!isUser && explanation && status !== 'error' && (
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1.5">
                  Como esta resposta foi construída
                </span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-2">
                  Esta resposta foi elaborada utilizando a documentação interna
                  da Leapy recuperada pelo mecanismo de busca semântica (RAG).
                </p>
                <div className="flex gap-1.5 items-start bg-zinc-50 dark:bg-zinc-900/30 p-2.5 rounded-md border border-zinc-100 dark:border-zinc-800/50">
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-zinc-400" />
                  <span className="text-[11px] text-zinc-600 dark:text-zinc-400 italic leading-relaxed">
                    {explanation}
                  </span>
                </div>
              </div>
            )}
          </div>

          {!isUser &&
            status === 'completed' &&
            sources &&
            sources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 w-full">
                <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-3">
                  Fontes consultadas
                </span>

                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mb-1.5 block">
                      Fonte principal
                    </span>
                    <div className="flex flex-col gap-1.5 py-2 px-3 rounded-md border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/20 w-full md:max-w-fit">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                        <FileText className="h-3.5 w-3.5 shrink-0 text-blue-500 opacity-80" />
                        <span className="break-all">{sources[0].source}</span>
                      </div>

                      {retrievalScore !== undefined && retrievalScore > 0 && (
                        <div className="flex flex-col gap-0.5 ml-5 mt-0.5">
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                            Confiança do contexto:{' '}
                            <strong className="font-medium text-zinc-700 dark:text-zinc-300">
                              {(retrievalScore * 100).toFixed(0)}%
                            </strong>
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                            Baseado na similaridade entre a pergunta e os
                            documentos encontrados.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {sources.length > 1 && (
                    <div>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mb-1.5 block">
                        Documentos relacionados
                      </span>
                      <ul className="flex flex-col gap-1.5 pl-0.5">
                        {sources.slice(1).map((s, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400"
                          >
                            <span className="text-zinc-300 dark:text-zinc-600 text-[10px]">
                              •
                            </span>
                            <span className="break-all">{s.source}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
