# ADR-002: Arquitetura RAG em vez de LLM Direto

## Problema

O Atlas precisa atuar como um assistente interno para Customer Success, respondendo de forma ultra precisa a dúvidas sobre regras de negócios, processos operacionais e políticas de clientes da Leapy. Utilizar um Large Language Model (LLM) puro (como disparar perguntas direto para o ChatGPT/OpenAI) traria os seguintes riscos inaceitáveis:

1. **Alucinação:** O LLM inventaria regras baseadas no seu viés estatístico de treinamento em vez da nossa política privada.
2. **Desatualização:** O LLM nativo desconhece as atualizações feitas nos documentos da empresa ontem ou hoje.
3. **Falta de Rastreabilidade:** O LLM puro não consegue citar a origem dos arquivos internos confidenciais (Não saberíamos de qual PDF ou MD a resposta veio).

## Alternativas Consideradas

### 1. Fine-tuning do Modelo

Treinar um LLM próprio injetando todos os nossos manuais nos pesos neurais do modelo.

- **Desvantagem:** Altíssimo custo de treinamento; necessidade de re-treinar a rede inteira sempre que um documento `onboarding.md` sofrer uma alteração de parágrafo. Nenhuma garantia de prevenção de alucinação.

### 2. Chamada Direta do LLM com Prompt Injection (O "Ctrl+C/Ctrl+V" humano)

O usuário cola o manual na aba do chat e faz a pergunta.

- **Desvantagem:** O limite da janela de tokens impede colar centenas de documentos corporativos. O processo é manual e inviável para uso automatizado de um software autônomo.

### 3. RAG (Retrieval-Augmented Generation)

Transformar toda a base em Embeddings vetoriais, recuperar matematicamente apenas as partes relevantes da dúvida e forçar o LLM a ler _apenas_ aquelas partes isoladas.

## Decisão Escolhida

**Optamos pelo padrão RAG (Retrieval-Augmented Generation).**

A arquitetura do Atlas contará com uma camada própria de domínio (`RagService`) e persistência vetorial (`VectorDBService`). A IA atuará puramente como um "Revisor de Texto" e não como uma enciclopédia; o seu papel é consolidar em linguagem natural a evidência factual coletada pelo banco de dados.

## Consequências

- **Positivas:**
  - Zero alucinação (desde que o System Prompt reforce o comportamento estrito).
  - Capacidade imediata de apontar a exata fonte do arquivo interno utilizado.
  - Atualização "Real-time" da base de conhecimento (Basta dar _Upsert_ no chunk do texto no banco Supabase e o conhecimento da IA atualiza imediatamente, sem custo de treinamento).
- **Negativas/Trade-offs:**
  - Complexidade arquitetural maior (Requer banco de vetores e script de _Ingestão_ vs um simples fetch API).
  - Mais latência de resposta se comparado a um LLM puro (adicionamos a etapa de rede do Vector DB no meio do caminho).
  - Necessidade de gerenciar permissões no nível de banco de dados (Row Level Security no Supabase restringindo acesso público e permitindo apenas leitura/gravação pelo backend seguro via `service_role`).
