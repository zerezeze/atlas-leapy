# Base de Demonstração (Demo Knowledge Base)

## Objetivo

O objetivo da base de demonstração (`docs/demo-leapy`) é fornecer um acervo de arquivos prontos e formatados perfeitamente para apresentações e _pitchs_ comerciais da plataforma Atlas. Com estes documentos, é possível validar em segundos todo o fluxo RAG (Upload -> VectorDB -> Chat -> Resposta).

## Documentos Disponíveis

Estão segmentados nas seguintes verticais da empresa fictícia "Leapy":

- **Financeiro:**
  - `cancelamento-enterprise.md`
  - `reembolso.md`
- **Produto:**
  - `integracoes.md`
  - `funcionalidades.md`
- **Onboarding:**
  - `primeiros-passos.md`
- **Suporte:**
  - `problemas-comuns.md`

## Exemplos de Perguntas para Demonstração (Roteiro)

Recomendamos seguir este roteiro de perguntas no chat após fazer o upload dos arquivos acima:

1. **Testando extração direta e regras financeiras:**
   _"Como funciona o cancelamento do plano Enterprise?"_
   **(Resposta Esperada:** A IA deve citar os 60 dias de aviso prévio e os 30% de multa).

2. **Testando exceções lógicas (Raciocínio LLM):**
   _"Quero cancelar o Enterprise, mas a culpa foi de vocês que não entregaram o SLA por dois meses. Tenho que pagar multa?"_
   **(Resposta Esperada:** A IA deve conectar a exceção do SLA e afirmar que não haverá multa).

3. **Testando visão técnica de Produto:**
   _"Quais as integrações suportadas atualmente? Posso colocar fotos no notion e integrar?"_
   **(Resposta Esperada:** A IA lista Slack, Drive, Salesforce, Notion. Diz que imagens do notion não são suportadas).

4. **Testando Resolução de Problemas:**
   _"O upload do meu PDF deu erro de tamanho, o que eu faço?"_
   **(Resposta Esperada:** Sugerir dividir o PDF ou assinar Enterprise para 50MB).
