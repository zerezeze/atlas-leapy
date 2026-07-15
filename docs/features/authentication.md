# Autenticação e Preparação para Multi-Tenant (Sprint 15)

O Atlas foi migrado para uma arquitetura autenticada, baseando-se no `Auth.js` (NextAuth v5) utilizando o Next.js App Router e Server Actions.

## Como funciona o fluxo de Autenticação?

1. **Credenciais Locais**: Optamos por utilizar o `CredentialsProvider` com senhas hasheadas por `bcryptjs`. As senhas jamais transitam em texto plano.
2. **Database Próprio**: Criamos uma tabela `users` simples e objetiva para governar o acesso. Não utilizamos as rotinas prontas do Supabase Auth no Frontend porque manter a validação dentro do backend (Node.js) protege mais o fluxo de RAG e nos dá maior controle do Multi-Tenant no futuro (separar clientes).
3. **Sessão baseada em JWT**: A sessão trafega em Cookies HTTP-Only gerados pelo NextAuth. A verificação nas bordas e nas chamadas acontece validando este token. O token carrega o `id`, `name`, e `email` do usuário.

## Roteamento e Middleware

Um arquivo `src/middleware.ts` na raiz atua como "guarda-costas" (Edge Middleware) interceptando todas as rotas da aplicação exceto arquivos estáticos (`.png`, `.css`), rotas de API `/api/auth` e a página `/login`.

- Se um usuário deslogado tenta acessar `/knowledge`, ele é chutado para `/login`.
- Se um usuário logado tenta acessar `/login`, ele é direcionado de volta ao Dashboard `/`.

## Segurança em Server Actions

Todas as Server Actions que invocam os serviços (como `uploadDocumentAction`, `deleteDocumentAction`, `sendMessageAction`) verificam a sessão explicitamente:

```typescript
const session = await auth();
if (!session?.user) throw new Error('Não autorizado.');
```

Isso impede que atacantes chamem as rotas do backend (RPCs) caso descubram os endpoints.

## Passos Rumo ao Multi-Tenant

Para preparar o sistema para isolamento de dados entre empresas no futuro, todos os repositórios vitais tiveram suas assinaturas estendidas para suportar o `userId`:

- `listConversations(userId?: string)`
- `listDocuments(userId?: string)`
- `deleteDocument(id: string, userId?: string)`

Hoje a tipagem existe. Na próxima sprint onde focaremos em Organizations e RLS puro por usuário, esse parâmetro ditará estritamente quais dados retornar do banco de dados (o banco fará o filtro final no `where`).
