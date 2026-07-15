# ADR-003: Adoção do modelo text-embedding-3-small (OpenAI)

## Problema

A arquitetura do Atlas (RAG) depende criticamente de um modelo capaz de transformar o texto (chunks) em representações matemáticas vetoriais (Embeddings) de alta qualidade para que a busca por Similaridade de Cosseno no banco de dados seja precisa, capturando o contexto semântico e não apenas léxico (exato). Precisamos definir qual modelo de Embedding utilizar no MVP de modo que balanceie custo, performance e compatibilidade de dimensionalidade com infraestruturas abertas.

## Alternativas Consideradas

### 1. Modelos Open-Source (ex: HuggingFace BGE / MiniLM)

Utilizar modelos rodando localmente (Local Embeddings).

- **Vantagem:** Custo financeiro nulo por chamada. Máxima privacidade.
- **Desvantagem:** Exige servidor com placa de vídeo (GPU) dedicada no backend da Leapy para rodar em tempo aceitável ou sobrecarrega o uso de CPU. Configuração devops pesada e dependência de Python em um ecossistema TypeScript/NodeJS.

### 2. text-embedding-ada-002 (OpenAI - Modelo Antigo)

- **Vantagem:** O padrão da indústria até 2023. Amplo suporte.
- **Desvantagem:** É mais caro e levemente menos assertivo em termos de compressão semântica que os modelos da Geração 3.

### 3. text-embedding-3-small (OpenAI - Modelo Atual)

Modelo de terceira geração lançado pela OpenAI focado em eficiência.

- **Vantagem:** Custo 5x menor do que o antigo `ada-002`. Dimensionalidade padrão universal (1536 dimensões) que encaixa em todos os bancos vetoriais, performance multi-idioma (ótimo para português/inglês) e gestão total feita via API Rest / Vercel AI SDK (sem gerenciar GPU própria).
- **Desvantagem:** Dependência de conexão de rede (API da OpenAI) para ingestão e consulta.

## Decisão Escolhida

**Optamos pelo modelo `text-embedding-3-small` da OpenAI.**

## Consequências

- **Performance:** Buscas extremamente precisas sem custo de infraestrutura local de hardware.
- **Facilidade:** Pluga nativamente na nossa feature já desenvolvida de `EmbeddingService` com o Vercel AI SDK.
- **Padronização:** A dimensão do array fixada em 1536 facilita a persistência (migração Supabase pgvector) de maneira padronizada, e, caso a gente mude para outro modelo OpenAI (como o `3-large`) no futuro, podemos continuar operando na mesma arquitetura de DB.
- **Segurança:** Será necessário garantir tratamentos de erro (timeout/falha) toda vez que fizermos Ingestão ou Busca, já que o Embedding será processado fora da nossa Vercel/EC2 (tratado pela criação do `EmbeddingError`).
