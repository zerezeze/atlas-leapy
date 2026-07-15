# Especificação Técnica: Busca Vetorial (Vector Search)

## 1. Objetivo da Busca Vetorial no Atlas

A busca vetorial é o motor central da arquitetura do Atlas. Como nosso produto precisa recuperar informações precisas a partir de uma vasta base de conhecimento institucional de forma semântica (e não apenas por correspondência exata de palavras-chave), a busca vetorial permite que o sistema "entenda" a intenção e o significado da pergunta do usuário. Ela retornará os fragmentos (chunks) de texto mais relevantes para que o assistente possa formular uma resposta embasada, cumprindo o princípio de nunca alucinar informações.

## 2. Onde a Busca Vetorial se encaixa no Pipeline RAG

A busca vetorial atua como a ponte exata entre a fase de Ingestão e a fase de Recuperação (Retrieval). No pipeline RAG, seu papel acontece em dois momentos distintos:

1. **No armazenamento (Write):** Recebe os vetores (Embeddings) gerados a partir dos chunks de documentos e os salva em um índice.
2. **Na consulta (Read):** Recebe o vetor gerado a partir da pergunta do usuário, calcula a distância matemática (como Cosine Similarity) contra todos os vetores salvos e retorna os "Top K" chunks mais parecidos semanticamente.

## 3. Opções Consideradas para Armazenamento Vetorial

Analisamos três das soluções mais proeminentes no mercado atual para arquiteturas de IA:

### Supabase PostgreSQL + pgvector

Uma solução de banco de dados relacional tradicional (Postgres) turbinada com a extensão open-source `pgvector`.

- **Prós:** Permite salvar dados relacionais (histórico de chat, usuários) e dados vetoriais no mesmo lugar. Ecossistema maduro, open-source e com excelente SDK para TypeScript.
- **Contras:** Requer um entendimento básico de bancos de dados relacionais e SQL/migrações.

### Pinecone

Um banco de dados vetorial puramente SaaS, focado exclusivamente em AI/Machine Learning.

- **Prós:** Infraestrutura totalmente gerenciada (Serverless), integração absurdamente fácil via API, extrema rapidez em larga escala. Zero configuração de infraestrutura.
- **Contras:** Serviço fechado (vendor lock-in). O tier gratuito permite apenas 1 índice (o que basta para MVP, mas limita segmentações avançadas gratuitas). Se precisarmos salvar outras coisas (histórico de conversas), precisaremos de outro banco de dados.

### Chroma (ChromaDB)

Um banco de dados vetorial AI-native open-source, muito popular no ecossistema LangChain.

- **Prós:** Pode rodar totalmente local (in-memory ou SQLite) durante o desenvolvimento, o que barateia e simplifica muito testes locais. Totalmente open-source.
- **Contras:** Para ir para produção real na nuvem, exige orquestração própria (ex: deploy em Docker/AWS/GCP), o que aumenta a carga de devops.

## 4. Critérios de Decisão

- **Simplicidade:** Quão rápido conseguimos plugar no nosso ecossistema Next.js 15?
- **Custo:** Deve ter um _free-tier_ generoso o suficiente para validação do MVP em ambiente de staging.
- **Manutenção:** Nenhuma ou mínima carga de devops para a equipe gerenciar.
- **Escalabilidade:** Deve suportar milhares de chunks de texto (toda a base da Leapy) de forma performática.
- **Adequação ao MVP:** Deve focar na entrega de valor rápido, sem fechar portas para o futuro.

## 5. Decisão Recomendada

**Recomendação: Supabase (PostgreSQL + pgvector)**

**Justificativa:**
Embora o Pinecone seja a opção mais simples para a busca puramente vetorial, o Supabase nos oferece a melhor fundação arquitetural para o MVP e além. Com o Supabase, matamos dois coelhos com uma cajadada só:

1. Podemos armazenar nossos vetores com excelente performance via `pgvector`.
2. Como o Atlas é um assistente interno, _imediatamente_ após o MVP precisaremos armazenar metadados relacionais, o histórico de conversas dos usuários (chats), feedback de respostas (thumbs up/down) e possivelmente sessões de autenticação.
   Adotar o Supabase agora significa que teremos **apenas um banco de dados para gerenciar**, reduzindo a complexidade da infraestrutura e custo, em vez de ter o Pinecone para vetores + um outro banco para histórico. Além disso, o _free-tier_ do Supabase é excepcional para o escopo do nosso MVP e totalmente gerenciado.

## 6. Fluxo Esperado da Informação

A cadeia completa desde o arquivo cru até o cérebro da IA seguirá este ciclo:

1. **Documentos:** Arquivos oficiais em `.md` são carregados da base (já implementado).
2. **Chunks:** O documento é fatiado em partes menores mantendo o contexto (já implementado).
3. **Embeddings:** Uma API de IA (ex: OpenAI `text-embedding-3-small`) transforma o texto do chunk em uma matriz numérica (vetor).
4. **Vector Storage:** O chunk original, seus metadados (`title`, `source`) e seu vetor são armazenados de forma persistente (Supabase).
5. **Similarity Search:** O usuário faz uma pergunta -> A pergunta vira vetor -> O Vector Storage busca os chunks mais similares matematicamente.
6. **Contexto para LLM:** Os textos dos chunks encontrados são injetados no _System Prompt_, forçando o LLM a gerar a resposta baseando-se _apenas_ naqueles textos específicos e fornecendo as fontes.
