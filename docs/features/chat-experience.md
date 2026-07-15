# Feature: Experiência de Chat (UX e Streaming)

## Objetivo

O módulo de Chat foi evoluído para se portar como um produto premium (SaaS) voltado para uso interno. O núcleo de RAG (Retrieval) atua nos bastidores alimentando a inteligência, mas a interface precisa ser responsiva, reativa e tolerante a falhas.

## Fluxo da Interface

O ChatContainer gerencia uma árvore de mensagens. A comunicação ocorre exclusivamente através do padrão Server Actions (Next.js) em modo stream.

### 1. Interação do Usuário

- Usuário digita na caixa e envia.
- Uma nova mensagem `Message` com papel `user` e status `completed` é injetada.
- Imediatamente, uma mensagem placeholder do assistente com papel `assistant` e status `streaming` é renderizada (exibindo cursor pulsante na UI indicando atividade da IA).

### 2. Comunicação e Streaming

- O `chatService.streamMessage` invoca a Server Action.
- O componente inicia um iterador assíncrono (`for await`) via `readStreamableValue`.
- Conforme o LLM devolve os tokens, a chave `content` da mensagem do assistente é sobreescrita iterativamente através da reatividade do React State (`setMessages`).

### 3. Finalização

- Ao encerramento do stream, o frontend seta o estado da mensagem para `completed`.
- As Fontes (`sources`) e o _Score de Similaridade_ (`retrievalScore`), que foram resolvidos de forma síncrona pela IA antes do começo do stream de texto, são fixados no card.
- O botão flutuante de "Copiar Resposta" é liberado.

## Estados Possíveis

O modelo central da UI (Interface `Message`) agora comporta um clico de vida, ideal para quando existir um futuro histórico de conversas em banco (Memória).

- **`streaming`**: O balão de texto reage a novos tokens parciais, sem exibir ferramentas adicionais (botão copy).
- **`completed`**: O texto está inteiro. O componente injeta os estilos finais, engatilha renderizadores de blocos pesados (se houvesse) e expõe as metadados.
- **`error`**: Renderiza um balão avermelhado capturando graciosamente qualquer falha de token, limite de requisição ou instabilidade no banco vetorial, sem derrubar a tela (Crash/White screen of death).

## Renderização de Conteúdo (Markdown)

Todo texto vindo do assistente passa pelo parser do componente `ChatMessage`, que engloba o `react-markdown` + `remark-gfm`.

- Títulos `#` e `##` recebem estilos tailwind nativos via propriedades `components`.
- Listas, _italicos_ e blocos de `código` são parseados, oferecendo legibilidade e hierarquia da informação perante políticas pesadas e densas geradas pelo Customer Success.
