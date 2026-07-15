# Pipeline de Embeddings

## Objetivo

Transformar o texto bruto particionado em uma representação matemática vetorial (Embedding). O Embedding resolve o problema de buscas literais (onde a IA precisaria encontrar a exata palavra-chave), convertendo sentenças com mesmo significado para posições próximas em um espaço multi-dimensional matemático, impulsionando buscas por sentido (Similares).

## Contexto

Atua como a ponte final no pipeline de conversão, posicionando-se entre os Chunks gerados nativamente pela nossa Base de Conhecimento e a camada final que irá persistir estes mesmos dados no Banco (Vector Store). Depende visceralmente da configuração centralizada da feature de IA (`aiConfig`).

## Fluxo

1. O processo em lote (`ingest.ts`) coleta arrays imensos de textos extraídos dos `DocumentChunk`s.
2. Interpela a função assíncrona do `EmbeddingService`.
3. Utilizando o SDK Abstrato da Vercel (`embedMany`), ele dispara múltiplas _Promises_ simultâneas contendo listas de textos para a API da OpenAI.
4. O _Service_ mapeia a resposta (que consiste em matrizes espaciais) alocando na mesma ordem correspondente dos chunks de entrada.
5. Retorna o array gerado em números puros (floats).

## Requisitos funcionais

- Lidar com geração em lote (batching) com o intuito de despachar chamadas eficientes de rede para redução de latência e consumo desnecessário de cotas na API da OpenAI.
- Realizar integração isolada de APIs externas (esconder complexidade HTTP e Auth).
- Tratar falhas no meio da transmissão para evitar corrompimento de bancos de dados posteriores se a rede cair ou o Token da OpenAI expirar.

## Requisitos técnicos

- Orquestração de SDK da Vercel (`ai`) utilizando provedores customizados oficiais (`@ai-sdk/openai`).
- Modelo utilizado compulsoriamente (no escopo atual): `text-embedding-3-small` da OpenAI, extraído por configuração do `env.ts`.

## Decisões tomadas

- **Modelo de Embedding da OpenAI:** A escolha do `text-embedding-3-small` deve-se ao fato de entregar custos incrivelmente baixos de consumo via API com enorme ganho de coerência semântica para casos textuais empresariais puros (como artigos internos), sendo, para 99% das situações corporativas RAG, superior ao seu predecessor (`ada-002`), tudo sob os padronizados vetores numéricos de dimensionalidade exata a 1536.
- **Isolamento de Domínio (Padrão Facade/Adapter):** Os SDKs da OpenAI não se encontram espalhados pela estrutura principal do RAG. Somente a camada `EmbeddingService` se comunica com eles, o que significa que podemos migrar a geração vetorial para outra engine (Google Text Gecko ou Anthropic) e a rota do projeto permanecerá perfeitamente inalterada.

## Fora de escopo

- Paralelismo orquestrado robusto (utilização de Redis, Celery, mensageria SQS). A ingestão opera via promessas puras locais de Node JS.
- Múltiplas estratégias de _retry_, _backoff_ exponencial super configurado e taxa de _rate limits_. Confiaremos no tratamento basal oferecido nativamente pelo Vercel SDK.
- Indexação multimodal e geradores de vetores de imagens ou áudios.

## Critérios de aceitação

- É possível invocar programaticamente o script principal (`ingest.ts`) no ambiente Node.
- O _Service_ consome com sucesso strings e as devolve como um `Array` de `Number[]` de tamanho idêntico e perfeitamente dimensionado.
- Os modelos instanciados utilizam rigorosamente os provedores parametrizados nas chaves de ambiente `Zod`.
