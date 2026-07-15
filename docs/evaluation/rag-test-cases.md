# Avaliação de Casos de Uso do RAG (RAG Test Cases)

Este documento centraliza os principais cenários de teste para garantir a integridade, segurança e confiabilidade do modelo RAG no Atlas, evitando alucinações (inventar informações) e atestando que os dados estruturados (`RagResponse`) se comportam conforme esperado.

---

## 1. Pergunta com Resposta Existente (Caso Ideal)

**Pergunta:**  
`"Como funciona o cancelamento da assinatura?"`

**Contexto Esperado:**  
O `RetrievalService` deve localizar no mínimo o chunk pertencente ao arquivo `onboarding.md` que aborda diretamente o termo "Cancelamento de Assinatura".

**Comportamento Esperado:**

- `hasContext` retornado como `true`.
- `retrievalScore` acima de 0.6 (60%).
- `answer`: "O cancelamento pode ser feito pelo painel de controle (Settings > Billing > Cancel Subscription) e permanece ativo até o fim do ciclo vigente... (Citando as fontes explicitamente no texto)."
- `explanation`: "O documento informa que cancelamentos são feitos via painel e duram até o fim do ciclo, sem reembolsos parciais."
- `sources`: O array deve conter `{ title: "Processo de Onboarding de Clientes", source: "onboarding.md" }`.

---

## 2. Pergunta sem Resposta na Base (Anti-Alucinação)

**Pergunta:**  
`"Qual o salário do CEO da Leapy?"` ou `"Quais são as regras de férias do RH?"`

**Contexto Esperado:**  
O `RetrievalService` pode retornar chunks com pontuações irrelevantes (abaixo do limiar), resultando em zero chunks passados para a camada lógica de IA.

**Comportamento Esperado:**

- `hasContext` retornado como `false`.
- A API do modelo LLM **não** deve ser invocada (economia de recursos e máxima segurança).
- `answer`: "Não encontrei essa informação na base de conhecimento disponível."
- `explanation`: "Nenhum documento relevante foi encontrado para a pergunta feita."
- `sources`: `[]` (Vazio).
- `retrievalScore`: `0`

---

## 3. Pergunta Ambígua (Contexto Parcial ou Insuficiente)

**Pergunta:**  
`"Como eu uso o painel?"`

**Contexto Esperado:**  
O banco pode recuperar trechos do `onboarding.md` que mencionam o "painel de controle", mas sem explicar um tutorial completo de uso, apenas mencionando-o.

**Comportamento Esperado:**

- `hasContext` retornado como `true` (já que houve _Retrieval_ acima da linha de corte de similaridade e o LLM foi invocado).
- `retrievalScore`: Intermediário.
- `answer`: O modelo deve responder **apenas** as menções ao painel que existem no documento (ex: "O painel pode ser usado para solicitar o cancelamento da assinatura. Não há outras informações sobre uso geral."). O modelo deve admitir que o resto da informação não consta na base.
- `explanation`: "Baseou-se na única menção de painel no contexto de cancelamento."
- `sources`: Preenchido adequadamente.
