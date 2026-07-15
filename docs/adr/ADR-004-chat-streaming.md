# ADR-004: Implementação de Streaming no Chat (Server Actions e JSON)

## Problema

A arquitetura original do RAG utiliza um modelo que retorna um JSON estruturado rígido (`RagResponsePayload`) contendo as chaves `answer` e `explanation`, operando de forma síncrona aguardando toda a geração do LLM para validar via Zod e enviar ao frontend.
A experiência do usuário em um chatbot síncrono é pobre, pois ele fica esperando segundos sem nenhum feedback.
Para melhorar a UX, precisamos implementar streaming parcial da resposta para que as palavras apareçam em tempo real. No entanto, enviar JSON parcial pela rede exige parser progressivo no frontend.

## Alternativas Consideradas

### 1. Modificar o `RagService` para retornar Stream

- **Desvantagem:** Quebra o princípio Aberto/Fechado (OCP). O serviço síncrono já está estável e acoplado a integrações externas. Forçar o LLM a retornar apenas texto livre desestrutura a possibilidade de obter as chaves "answer" e "explanation" de forma bem delimitada.

### 2. Uso do `streamText` puro (Removendo o schema JSON)

- **Desvantagem:** Exigiria mudar o System Prompt para o LLM parar de gerar JSON, o que violaria a restrição técnica imposta na Sprint de preservar o contrato de integração sempre que possível.

### 3. `streamObject` com Server Actions (`createStreamableValue`)

Utilizar a feature do Vercel AI SDK de `streamObject`, que foi feita especificamente para manter a adesão a Schemas Zod enquanto envia objetos parciais sob demanda.

## Decisão Escolhida

**Criar uma fachada de Streaming (`RagStreamService`) e Server Actions (`createStreamableValue`).**

A arquitetura escolhida foi:

1. Manter o `RagService` original intacto.
2. Criar `RagStreamService` que faz o exato mesmo roteiro de _Retrieval_, mas ao chamar a IA, invoca `streamObject`.
3. A Server Action `sendMessageStreamAction` encapsula o fluxo do `partialObjectStream` em um gerador iterável `createStreamableValue` do pacote `ai/rsc`, enviando o JSON progressivo para a interface.
4. A UI utiliza o hook `chatService.streamMessage` que roda um iterador assíncrono para ler as chaves e popular os balões de texto em tempo real sem quebrar o HTML.

## Consequências

- **Positivas:**
  - O contrato original do `RagResponse` é preservado, sem mutação dos serviços centrais.
  - O usuário ganha a experiência de ler a resposta progressiva palavra por palavra.
  - Tratamento nativo de _Types_ com Zod garantindo que o que chega na ponta é o formato esperado.
- **Negativas/Trade-offs:**
  - Complexidade marginal adicional no frontend por ter que lidar com iteradores assíncronos (`for await (const partial of readStreamableValue...)`).
