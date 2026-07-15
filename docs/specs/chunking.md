# Módulo de Chunking

## Objetivo

Preparar os documentos extraídos da Base de Conhecimento ao fatiá-los em partições textuais menores (chunks). O principal intuito é viabilizar o processamento matemático pelo modelo de Embedding, pois injetar um manual institucional de 50 páginas diretamente em uma busca vetorial fará com que o contexto seja perdido no pipeline de LLM ou que os limites estritos de Tokens de provedores de IA sejam estourados.

## Contexto

Este módulo posiciona-se logo na sequência do Parser. Ele recebe o texto massivo do `KnowledgeDocument`, recorta-o de modo inteligente e repassa a carga subdividida (array de `DocumentChunk`) para a etapa final de geração de Embeddings.

## Fluxo

1. Recebe um objeto `KnowledgeDocument` populado.
2. Intercepta a `string` bruta e a subdivide baseando-se no delimitador de parágrafo duplo (`\n\n`).
3. Agrupa os parágrafos colidindo-os sequencialmente até se aproximar do limite (ex: 800 caracteres), evitando divisões bruscas (janela estática baseada em limite).
4. Embala cada parte agrupada em um novo objeto rastreável, gerando e retornando uma lista de instâncias de `DocumentChunk`.

## Requisitos funcionais

- Fragmentar documentos muito longos em fatias toleráveis por motores de Embeddings.
- Preservar frases, tópicos em listas, ou estruturas nativas sem cortar informações críticas ao meio.
- Assegurar a rastreabilidade total: toda fatia isolada precisa saber de onde veio (do documento X, com o título Y, e ocupa a posição Z na ordem).

## Requisitos técnicos

- Função de caráter puro, altamente determinística e testável, sem _Side-Effects_ (não faz chamadas de rede nem writes no disco).
- Geração de chaves (IDs) por Hashing criptográfico simples (Node `crypto`) combinando o ID original + o _Chunk Index_.
- Resolução rápida (complexidade ciclomática linear `O(N)`) a fim de otimizar a velocidade de Ingestão de massas muito grandes de dados.

## Decisões tomadas

- **Paragraph-level Chunking (Divisão por quebra de parágrafo dupla):** Decidimos que a forma de gerar divisões para o MVP (onde os arquivos da base de conhecimento vêm em Markdown) não usará processadores robustos de linguagem natural ou tokenizadores complexos. Markdown estrutura suas quebras lógicas através da notação `\n\n`, e o agrupamento baseando-se nela é determinístico e extremamente leve computacionalmente.

## Fora de escopo

- Otimização algorítmica de sobreposição (_Overlap Strategy_) visando recortes que cruzem o final de um parágrafo com o início do próximo.
- _Semantic Chunking_ — quebra do documento por agrupamento real de significados baseados na leitura prévia feita por IA ou agrupadores como Spacy/NLTK.
- Divisão hierárquica baseada nos níveis de Títulos do Markdown (ex: um chunk separado a cada tag `##`).

## Critérios de aceitação

- Dado um texto muito grande (superior a 1500 caracteres, por exemplo), o serviço divide e retorna `N` objetos `DocumentChunk`.
- A concatenação direta de todos os `content` retornados na ordem gerada aproxima-se do tamanho original textual.
- A função atribui IDs consistentes, gerando exatamente os mesmos hashes toda vez que rodar sobre o exato mesmo documento textual (idempotência).
