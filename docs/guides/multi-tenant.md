# Guia Multi-Tenant

O Atlas foi atualizado para suportar múltiplas organizações. Todas as interações com o banco de dados e os serviços fundamentais agora exigem um contexto organizacional.

## Como funciona

- Os usuários pertencem a uma organização (`organization_id`).
- No momento do login, o Auth.js (NextAuth) inclui o `organizationId` na Sessão (`session.user.organizationId`).
- Todos os recursos criados (Conversas, Documentos, Chunks de Vetores) também pertencem a essa organização.
- O mecanismo RAG filtra automaticamente as buscas vetoriais para garantir que apenas os documentos da organização do usuário logado sejam recuperados e incluídos no contexto do LLM.

## Adicionando novas Funcionalidades

Quando você criar uma nova tabela, repositório ou action, siga as seguintes regras:

1. **Schema do Banco de Dados**
   - Sempre adicione uma coluna `organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`.
   - Adicione índices para otimizar queries que filtrem por `organization_id`.

2. **Server Actions (`use server`)**
   - SEMPRE recupere a sessão do usuário com `const session = await auth();`.
   - Lance erro se não autorizado.
   - Extraia a organização: `const organizationId = session.user.organizationId;`.
   - Passe o `organizationId` para todos os Services ou Repositories.

3. **Services e Repositories**
   - Atualize a assinatura dos métodos para aceitar e exigir `organizationId: string`.
   - Ao executar chamadas via Supabase Client (`supabase.from(...)`), inclua `.eq("organization_id", organizationId)` logo após o `select()`, `update()` ou `delete()`.
   - Ao criar novos registros, garanta que a propriedade `organization_id` está sendo injetada nos dados de `insert()`.

## Exemplo

**Server Action**

```typescript
import { auth } from '@/auth';

export async function minhaAction() {
  const session = await auth();
  if (!session?.user) throw new Error('Não autorizado');

  const organizationId = session.user.organizationId;
  return myService.buscarDados(organizationId);
}
```

**Service**

```typescript
class MyService {
  async buscarDados(organizationId: string) {
    const supabase = getSupabaseAdminClient();
    const { data } = await supabase
      .from('minha_tabela')
      .select('*')
      .eq('organization_id', organizationId);

    return data;
  }
}
```
