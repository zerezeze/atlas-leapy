# Funcionalidades Principais da Plataforma

## O Atlas

O Atlas é a engine de Inteligência Artificial da Leapy. É uma solução SaaS baseada em RAG (Retrieval-Augmented Generation) projetada para orquestrar conhecimento corporativo.

### 1. Ingestão Multiformato

A plataforma suporta o upload nativo de:

- Documentos Word (`.docx`)
- Arquivos PDF (`.pdf`)
- Documentos Markdown (`.md`)
- Texto Plano (`.txt`)

O processo de ingestão quebra (chunking) os arquivos de forma semântica, gerando embeddings neurais.

### 2. Chat Inteligente (Streaming)

O principal ponto de contato dos usuários. Ao fazer uma pergunta, o Atlas pesquisa semanticamente nos arquivos da organização, constrói o contexto, e responde de forma progressiva (efeito máquina de escrever).

### 3. Citations e Confiança

Toda resposta gerada pelo Atlas obrigatoriamente vincula a fonte da informação. O usuário consegue clicar e saber exatamente de qual arquivo e bloco (chunk) a informação foi tirada. Se a IA não encontrar informações na base da organização, ela dirá "Não encontrei informações" para evitar alucinações.

### 4. Multi-Tenant Isolado

Empresas diferentes (Tenants) acessam a mesma infraestrutura, porém os dados vetoriais, usuários e histórico são protegidos criptograficamente no banco de dados através da regra de `organization_id`. Uma empresa A jamais consegue consultar o RAG com documentos da empresa B.
