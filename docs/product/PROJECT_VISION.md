# Visão do Produto: Atlas

## Visão do Produto

Fornecer à equipe de Customer Success da Leapy um assistente inteligente e altamente confiável, que aja como um "especialista instantâneo" sobre toda a documentação da empresa, capacitando o time a resolver dúvidas e problemas dos clientes com máxima agilidade e precisão.

## Problema que será resolvido

No dia a dia, analistas de Customer Success gastam um tempo considerável navegando por múltiplos repositórios, bases de conhecimento e sistemas de arquivos para localizar informações oficiais atualizadas. Essa fragmentação da informação prolonga o tempo de resposta, gera atrito operacional e aumenta o risco de fornecer informações desatualizadas ou desalinhadas com os processos da Leapy.

## Público-alvo

O sistema é de uso estritamente **interno**, direcionado aos:

- Especialistas e Analistas de Customer Success (CSMs) da Leapy.
- Profissionais da equipe de Suporte e Atendimento.

## Objetivos

- **Reduzir o tempo de busca**: Facilitar a pesquisa de informações através de linguagem natural.
- **Garantir a veracidade**: Centralizar o acesso a documentos oficiais em uma interface única.
- **Embasar o atendimento**: Aumentar a segurança e a produtividade da equipe durante a elaboração de respostas para o cliente final.

## Escopo inicial (MVP)

- Interface web simples, limpa e funcional, focada em interações de busca e leitura.
- Motor de Inteligência Artificial usando a arquitetura RAG (Retrieval-Augmented Generation).
- Processamento e recuperação de informações limitados unicamente aos documentos oficiais fornecidos ao sistema.
- Respostas contextualizadas com referências claras aos documentos e trechos utilizados na construção do texto.

## O que está fora do escopo

Para a primeira versão, os seguintes itens não serão abordados:

- Interação direta da Inteligência Artificial com o cliente final (uso puramente interno).
- Integrações ativas com sistemas terceiros (como CRMs, Zendesk, Salesforce) para ler dados específicos do cliente.
- Autenticação avançada e controle de acessos (RBAC).
- Execução de ações autônomas na plataforma (o assistente apenas lê e responde; não escreve, altera ou deleta dados da plataforma).

## Princípios do Produto

1. **Nunca inventar informações**: É absolutamente proibido gerar respostas embasadas em conhecimentos gerais (alucinação); as respostas devem derivar apenas dos documentos da Leapy.
2. **Sempre informar a origem das respostas**: O assistente deve sempre citar o documento fonte de forma transparente para permitir a validação humana.
3. **Priorizar precisão acima de criatividade**: O produto deve entregar um conteúdo direto, profissional e 100% factual, abrindo mão de linguagem floreada ou criativa.
4. **Informar claramente quando a documentação não contiver uma resposta**: Se a base oficial não tiver a resposta, o assistente deve adotar uma postura honesta e declarar que não sabe, orientando o CS a consultar outros canais internos.
5. **Construir um produto simples, confiável e preparado para evoluir**: A base do projeto será enxuta, focando na solidez da recuperação de informação, deixando complexidades e refinamentos de negócio para o futuro.
