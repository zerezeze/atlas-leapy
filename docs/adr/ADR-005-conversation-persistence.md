# ADR-005: Persistência de Conversas e Histórico (Sprint 12)

## Problema

A interação com o RAG e com o modelo LLM funcionava perfeitamente com respostas transmitidas sob demanda (Streaming via Server Actions). Porém, toda recarga de página resultava na perda do contexto, e o usuário não conseguia resgatar conversas antigas (sessões). O aplicativo precisava do modelo base de histórico de chats encontrado em assistentes avançados.

## Alternativas Consideradas

### 1. Salvar no localStorage do navegador

- **Pró:** Implementação extremamente rápida.
- **Contra:** Não permite sincronização entre dispositivos. Não gera telemetria ou log útil para a empresa entender o uso da IA. Impossibilita integrações B2B no futuro.

### 2. Salvar durante o Streaming via Front-end

- **Pró:** Fácil de implementar, o cliente apenas mandaria "Salvar" quando o texto terminasse.
- **Contra:** Vulnerável. O cliente poderia forjar a requisição de salvamento, manipular os metadados (como _retrieval score_ e _fontes_) ou simplesmente a aba poderia ser fechada durante o stream, perdendo a resposta.

### 3. Salvar no Back-end utilizando `service_role` e RLS Restrito (Escolha Atual)

O banco Supabase terá as tabelas sob sua gestão, mas bloqueadas publicamente (Row Level Security restrito). Quem grava os dados é a própria _Server Action_ que consumiu o Stream.

## Decisão Escolhida

Foi escolhida a persistência nativa via PostgreSQL/Supabase controlada por **Server Actions** no Next.js (lado Servidor).

- **Como funciona:** O usuário envia uma mensagem para a `sendMessageStreamAction`. Ela gera uma nova entrada em `conversations` (se ainda não existir). Salva a pergunta. Executa o RAG e inicia o Stream para o cliente. Quando o loop interno do stream finaliza (escondido do usuário no servidor), o backend junta a string total e a salva em `messages` com status `completed`.

- **Extensibilidade e RLS:**
  - Adicionou-se uma coluna `metadata` (JSONB) na tabela `messages` para suportar futuras medições sem alterar o esquema de dados (ex: tokens consumidos, custos, ID do modelo utilizado).
  - Como a aplicação ainda não possui sistema de contas (Auth), o campo `user_id` em `conversations` fica opcional. A extração dos dados se baseia na URL via Roteamento e chamadas restritas no servidor (`service_role`).

## Consequências

- **Positivas:**
  - Tolerância a falhas: se a internet do cliente cair durante o streaming, a resposta gerada ainda é persistida perfeitamente no banco de dados.
  - Segurança de dados via RLS.
  - Flexibilidade de métricas graças à coluna JSONB.
- **Negativas/Limitações temporárias:**
  - Como não há login no momento, a identificação dos usuários é nula, e os links `/c/[id]` podem ser acessados por qualquer pessoa da rede que conheça o UUID. (Isso será corrigido na próxima etapa de desenvolvimento da aplicação introduzindo Auth).
