# Integrações Nativas da Leapy

## Contexto

O ecossistema da Leapy é desenhado para se comunicar com as principais ferramentas corporativas de mercado. Nossas integrações visam centralizar as bases de conhecimento fragmentadas das empresas.

## Integrações Suportadas

### 1. Slack

- Sincronização de threads e FAQs de canais específicos.
- Bot Leapy: Permite que os usuários consultem a base de conhecimento (RAG) direto de um canal no Slack usando o comando `/leapy ask`.

### 2. Google Drive

- Integração unidirecional. A Leapy sincroniza periodicamente (a cada 24 horas) pastas selecionadas do Google Drive que contenham PDFs e Docs.
- **Requisito**: A conta vinculada deve ser de um administrador do Google Workspace.

### 3. Salesforce

- Permite vincular as respostas do atendimento ao cliente (Service Cloud) na Knowledge Base do Atlas, ajudando a treinar a IA com casos reais de fechamento de tickets.

### 4. Notion

- Suporte experimental. A importação extrai o conteúdo de blocos de texto, tabelas e cabeçalhos.
- Imagens inseridas no Notion não são convertidas em contexto textual no momento.

## Segurança e Permissões

- Todas as integrações utilizam o protocolo **OAuth 2.0**.
- A Leapy não armazena credenciais puras, operando via tokens com rotação automática.
- Para desvincular uma integração, basta acessar Configurações > Integrações e clicar em "Revogar Acesso".
