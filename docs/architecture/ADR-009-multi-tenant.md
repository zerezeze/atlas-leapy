# ADR 009: Multi-Tenant Architecture

## Status

Aceito

## Contexto

O Atlas foi inicialmente construído como uma aplicação single-tenant. No entanto, para suportar o modelo de negócio SaaS da Leapy, o Atlas precisou ser transformado em uma plataforma Multi-Tenant. O requisito primário era garantir o isolamento absoluto dos dados entre as empresas (Organizações) sem alterar a lógica e a arquitetura fundamentais do RAG (Retrieval-Augmented Generation).

## Decisão

Decidimos implementar o multi-tenancy usando um modelo de dados isolado por coluna (`organization_id`) no banco de dados.

1. **Schema**: Uma nova tabela `organizations` foi criada.
2. **Relacionamentos**: Adicionamos `organization_id` como chave estrangeira (`NOT NULL`) nas tabelas `users`, `documents`, `conversations` e `knowledge_chunks`.
3. **Isolamento de Vetores**: O mecanismo de busca semântica, que utilizava a RPC (Remote Procedure Call) `match_chunks` no PostgreSQL via pgvector, foi atualizado. A assinatura da função foi modificada para receber `p_organization_id uuid`, alterando a cláusula `where` para buscar estritamente vetores pertencentes à organização. Isso previne o vazamento de conhecimento inter-cliente no nível de banco de dados.
4. **Sessão do Usuário**: Ampliamos o módulo do Auth.js v5 para incluir o `organizationId` no token JWT e na Sessão (`session.user.organizationId`).
5. **Aplicação (Services & Repositories)**: Todos os fluxos de leitura e gravação nas tabelas relativas à organização foram refatorados para obrigatoriamente exigir, receber e filtrar por `organization_id` no nível do ORM (Supabase Client).

## Consequências

- **Positivas:**
  - O isolamento foi assegurado por meio de SQL seguro no nível de RPC e verificação no servidor em todas as Actions.
  - A arquitetura existente do RAG não sofreu alterações conceituais (embeddings e retrieval continuam funcionando como antes, apenas com filtros adicionais).
  - O código-fonte permanece fortemente tipado com TypeScript, sem o uso de `any`.
- **Negativas/Atenção:**
  - Toda nova query ou tabela que dependa de contexto organizacional precisará adicionar explicitamente o filtro de `organization_id`, o que exige atenção contínua no desenvolvimento de novas funcionalidades.
  - O Row Level Security (RLS) completo do Supabase não está ativado de forma estrita em toda a aplicação ainda (muitas interações usam o Admin Client para contornar limitações no ambiente de servidor); o isolamento é reforçado logicamente via aplicação e RPC.
