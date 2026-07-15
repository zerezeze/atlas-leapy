# ADR 008: Adoção do Auth.js (NextAuth) e Desacoplamento do Supabase Auth

**Data:** 15 de Julho de 2026
**Status:** Aceito

## Contexto

Durante a Sprint 15, surgiu a necessidade de proteger as rotas do Atlas e implementar um fluxo de login para suportar, futuramente, múltiplos tenants (empresas/usuários). Nosso banco de dados é gerido via Supabase, que oferece seu próprio serviço de Autenticação (Supabase Auth / GoTrue). No entanto, o Next.js App Router tornou-se extremamente maduro com o Auth.js (NextAuth v5).

## Decisão

Decidimos utilizar o **Auth.js** no backend/frontend do Next.js em vez do SDK client-side do Supabase Auth.

1. **Gestão Independente (Credentials)**: Criamos nossa própria tabela `users`. O Supabase Auth amarra muita complexidade na tabela invisível `auth.users`, dificultando join e manipulação para arquiteturas multi-tenant customizadas.
2. **Next.js App Router First**: O Auth.js integra perfeitamente com Server Actions e Middleware no edge runtime. Ao usar o Supabase Auth no App Router, o fluxo de manipulação de Cookies às vezes é frágil nas Server Components.
3. **Agnoticismo de Provedor**: Ao usar Auth.js, se um dia o projeto migrar do Supabase para Postgres cru na AWS RDS, a camada de autenticação não perderá sequer 1 linha de código, pois já domina o banco.
4. **Segurança Centralizada**: A validação (comparação do hash `bcrypt`) ocorre isoladamente dentro do server em Node.js. O banco de dados só recebe consultas via `service_role`.

## Consequências

- Precisaremos gerir manualmente "Esqueci minha senha" (enviar e-mail) no futuro.
- A aplicação Node.js é 100% autossuficiente para gerar e revogar sessões, mantendo o RLS do Supabase apenas como última linha de defesa com `service_role`.
- O código cliente não carrega bibliotecas de autenticação externas, mantendo o bundle leve.
