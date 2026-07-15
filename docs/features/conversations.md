# Feature: Domínio de Conversas (Histórico)

## Objetivo

O domínio `conversations` foi criado para persistir o histórico de uso e engajamento da inteligência artificial pelos clientes.

O Atlas atua não apenas como uma ferramenta pontual, mas como um oráculo com o qual o usuário dialoga longamente. Por isso, a manutenção do fluxo da conversa é vital.

## Arquitetura de Dados (Supabase)

### Tabela: `conversations`

Entidade raiz da sessão.

- **`id`**: UUID v4 identificador da sessão. (Presente na URL `/c/[id]`).
- **`title`**: String limitadora de 40 caracteres, derivada automaticamente da primeira pergunta feita pelo usuário na sessão.
- **`user_id`**: Opcional (Futuramente referenciará a tabela de usuários autenticados).
- Timestamps de criação e modificação.

### Tabela: `messages`

Os balões de interação guardados individualmente para formar uma "Thread".

- **`id`**: UUID.
- **`conversation_id`**: Foreing Key (cascade) referenciando `conversations`.
- **`role`**: `user`, `assistant` ou `system`.
- **`content`**: String literal contendo Markdown e formatações brutas.
- **`status`**: Estado final do processo de geração (`completed`, `error`, ou `streaming`). No banco, usualmente só persistem respostas finais.
- **`metadata`**: Coluna extensível (JSONB) voltada para Data Engineers e Telemetria. Poderá abrigar dados como latência do LLM (ms), tokens gastos de input/output, custo da operação e modelo base utilizado na chamada específica.
- **`sources`** e **`retrieval_score`**: Metadados essenciais de confiabilidade armazenados da resposta do RAG, documentando exatamante sob que contexto a IA tomou uma decisão de fala.

## Fluxo de Processamento (Server Actions)

Diferente do trivial, nós não utilizamos formulários REST comuns de Insert. Toda escrita é mediada pelo trâmite de Streaming.

1. **Início do Chat:** O usuário acessa `/`. Ao despachar um texto, o cliente chama `chatService.streamMessage(texto)`.
2. **Server Action e Conversa:** A action `sendMessageStreamAction` avalia se um `conversationId` foi injetado. Como não foi, ela contata o `ConversationService` para criar uma `conversations` nova, aproveitando o texto recebido para criar o `title`.
3. **Persistência do Usuário:** O registro da pergunta (`user`) é gravado de imediato.
4. **Streaming para UI:** A IA inicia a geração via `ragStreamService`. O canal assíncrono envia imediatamente as respostas em tempo real de volta para o React.
5. **A UI Navega Mágicamente:** Assim que o cliente reage ao primeiro chunk do stream, ele repara que recebeu também um ID de conversa recém-gerado. Instantaneamente ele invoca um soft navigation do Next.js (`router.replace('/c/[id]')`), alterando a URL sem matar a conexão de stream.
6. **Finalização Silenciosa:** O LLM conclui sua resposta dentro do ambiente isolado do Servidor (Node Runtime). O laço `for await` detecta o término e, sem que o cliente saiba, orquestra um `INSERT` da resposta inteira em `messages`.

## Políticas de Segurança (RLS)

Por segurança arquitetural da camada de RAG, tudo que tange as chamadas LLM e Ingestão foi isolado no backend.
Sendo assim, as tabelas ativaram **Row Level Security (RLS)**, mas _bloquearam inteiramente_ acessos `anon` e `authenticated`. Somente perfis `service_role` (O Admin Client Server-Side) conseguem interagir com os históricos.
