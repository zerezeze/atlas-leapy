import { BaseLayout } from '@/components/layout/BaseLayout';
import {
  Compass,
  FileText,
  Database,
  Search,
  Bot,
  Zap,
  Shield,
  History,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <BaseLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-12 px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm">
              <Compass className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Sobre o Atlas
            </h1>
          </div>

          <p className="text-lg text-muted-foreground mb-12 max-w-2xl leading-relaxed">
            O Atlas é um Assistente Inteligente de Customer Success construído
            com a arquitetura{' '}
            <strong>RAG (Retrieval-Augmented Generation)</strong>. Ele foi
            desenvolvido para consultar e responder perguntas baseadas
            exclusivamente na base de conhecimento institucional da Leapy,
            prevenindo alucinações.
          </p>

          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-500" />
            Como funciona a Arquitetura RAG
          </h2>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {/* Flow Steps */}
              <div className="flex flex-col items-center text-center gap-3 z-10">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 border flex items-center justify-center shadow-sm">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">1. Documentos</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Base de dados da Leapy em Markdown
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-3 z-10">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 border flex items-center justify-center shadow-sm">
                  <Database className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">2. Embeddings</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Transformação do texto em vetores
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-3 z-10">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 border flex items-center justify-center shadow-sm">
                  <Search className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">3. pgvector</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Busca vetorial por similaridade
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-3 z-10">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 border flex items-center justify-center shadow-sm">
                  <Bot className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">4. LLM Contextual</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Geração de resposta (Vercel AI SDK)
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-3 z-10">
                <div className="w-12 h-12 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border flex items-center justify-center shadow-md">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">5. Resposta</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Streaming rico com fontes anexadas
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Diferenciais do Produto
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 shadow-sm">
              <Shield className="h-5 w-5 text-indigo-500 mb-3" />
              <h3 className="font-semibold text-sm mb-2">Anti-alucinação</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                As respostas são estritamente limitadas ao conteúdo
                institucional providenciado pelo retrieval. O modelo não utiliza
                conhecimento geral para responder.
              </p>
            </div>

            <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 shadow-sm">
              <FileText className="h-5 w-5 text-blue-500 mb-3" />
              <h3 className="font-semibold text-sm mb-2">
                Transparência de Fontes
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Toda afirmação gerada acompanha o índice de confiança vetorial e
                o link exato para o documento e fragmento consultado no
                Supabase.
              </p>
            </div>

            <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 shadow-sm">
              <History className="h-5 w-5 text-amber-500 mb-3" />
              <h3 className="font-semibold text-sm mb-2">
                Histórico Persistente
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                As conversas e sessões são persistidas via Server Actions no
                banco de dados. Os usuários podem retornar a análises anteriores
                com facilidade.
              </p>
            </div>

            <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 shadow-sm">
              <Database className="h-5 w-5 text-emerald-500 mb-3" />
              <h3 className="font-semibold text-sm mb-2">
                Infraestrutura Escalável
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Utilizando Edge Runtime para streaming e PostgreSQL HNSW para
                similaridade, o sistema está desenhado para milhares de chunks.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Link href="/">
              <Button className="rounded-full px-8 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-md h-12 text-sm font-medium">
                Voltar para o Chat
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
