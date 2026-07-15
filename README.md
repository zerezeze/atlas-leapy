# 🪐 Atlas - Plataforma SaaS RAG Multi-Tenant

**Atlas** é uma plataforma avançada de IA Corporativa baseada em RAG (Retrieval-Augmented Generation). Ela permite que múltiplas organizações (Multi-Tenant) façam o upload de suas próprias bases de conhecimento (PDF, DOCX, Markdown, Text) de forma completamente isolada, consultando os documentos por meio de um Chatbot de IA com respostas em tempo real (Streaming), explicações detalhadas das fontes (Citations) e retenção de histórico.

O Atlas foi desenvolvido como o projeto final e desafio de engenharia avançada pela **Leapy**.

## 🚀 Principais Funcionalidades

- **Autenticação Multi-Tenant**: Cada usuário e documento é isolado rigidamente por `organization_id` no banco de dados, prevenindo qualquer vazamento de dados entre clientes.
- **RAG Pipeline Customizado**:
  - Geração de vetores através da OpenAI (`text-embedding-3-small`).
  - Banco de Dados Vetorial através do PostgreSQL com a extensão `pgvector`.
  - Chat inteligente com o `gpt-4o-mini`.
- **Knowledge Base Extensível**: Suporte à ingestão flexível de documentos corporativos: `.pdf`, `.docx`, `.md` e `.txt` via Parsers Server-Side (Open/Closed Principle).
- **Streaming UI**: Respostas da IA sendo geradas progressivamente na interface.
- **Citations UI**: Exibição da fonte e trecho exato de onde a IA retirou a resposta.

## 🛠️ Stack de Tecnologia

A aplicação foi rigorosamente construída sem uso do tipo `any`, seguindo princípios SOLID, limpos e otimizada para o App Router do Next.js.

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI / Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) + Componentes [shadcn/ui](https://ui.shadcn.com/) e [Lucide Icons](https://lucide.dev/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Autenticação**: [Auth.js v5 (NextAuth)](https://authjs.dev/)
- **Banco de Dados**: [Supabase](https://supabase.com/) (PostgreSQL + pgvector)
- **IA (LLM/Embeddings)**: [OpenAI](https://openai.com/) via [Vercel AI SDK](https://sdk.vercel.ai/)
- **Parsers de Arquivos**: `pdf-parse` e `mammoth`

## ⚙️ Executando o Projeto Localmente

1. **Clone o repositório e instale as dependências**

   ```bash
   pnpm install
   ```

2. **Variáveis de Ambiente**
   Copie o arquivo de exemplo e preencha com as suas chaves reais.

   ```bash
   cp .env.example .env
   ```

   _Certifique-se de configurar a API da OpenAI, os acessos do Supabase e o Secret do NextAuth._

3. **Banco de Dados**
   O Supabase requer a execução dos scripts SQL encontrados em `/supabase/migrations`. Garanta que a extensão `vector` está habilitada e as tabelas criadas.

4. **Rodando a Aplicação**
   ```bash
   pnpm dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## ☁️ Deploy para Produção (Vercel)

A plataforma já possui toda a integração necessária (Lint, TypeScript estrito, Actions Server-Side) desenhada para deploy na nuvem.

Para fazer o deploy em produção:

1. Faça o fork/push deste repositório para o seu GitHub.
2. Acesse a [Vercel](https://vercel.com/new).
3. Importe o repositório.
4. Adicione as mesmas variáveis de ambiente (`OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`).
5. Clique em **Deploy**.

---

_Construído com excelência pela Engenharia Leapy._
