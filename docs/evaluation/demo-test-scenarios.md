# Cenários de Teste para a Demonstração (Demo RAG)

Estes cenários foram concebidos para validar o comportamento real do Atlas respondendo perguntas do dia a dia de um time de Customer Success da Leapy.

## 1. Pergunta sobre SLAs (Contexto Específico)

**Pergunta:** Como funciona o cancelamento de clientes Enterprise?

- **Documento Esperado:** `financeiro/cancelamento.md`
- **Resposta Esperada:** O cancelamento exige aviso prévio de 60 dias. Se houver quebra antes dos 12 meses, aplica-se multa de 30% do valor residual, exceto se a Leapy descumprir o SLA de uptime de 99.9% por três meses.
- **Comportamento Esperado:** Rastreabilidade exata do arquivo e recuperação da regra da multa, sem se confundir com o cancelamento do plano Startup.

## 2. Pergunta de Procedimento (Passo a Passo)

**Pergunta:** O que fazer quando um cliente reporta que o sistema está fora do ar?

- **Documento Esperado:** `cs/processos-atendimento.md`
- **Resposta Esperada:** Abrir ticket urgente no Jira com a tag `CRÍTICO_SISTEMA`. O SLA de retorno da engenharia é de 30 minutos. Não prometer prazo absoluto para o cliente.
- **Comportamento Esperado:** A resposta deve ser procedimental, como um manual interno, focada na ação do agente de CS.

## 3. Pergunta Técnica de Produto

**Pergunta:** Quais integrações estão disponíveis no plano Startup?

- **Documento Esperado:** `produto/integracoes.md`
- **Resposta Esperada:** No plano Startup estão disponíveis integrações nativas com HubSpot, Slack, Microsoft Teams, Google Workspace e acesso à API pública com limite de 100 requisições por minuto. (Salesforce é excluído pois é apenas Enterprise).
- **Comportamento Esperado:** Inteligência dedutiva do LLM em ler o documento de integrações e cruzar quais não têm a restrição "Exclusivo Enterprise".

## 4. Pergunta Fora do Domínio (Escudo Anti-Alucinação)

**Pergunta:** Quais são os benefícios de plano de saúde dos funcionários da Leapy?

- **Documento Esperado:** Nenhum.
- **Resposta Esperada:** "Não encontrei essa informação na base de conhecimento disponível."
- **Comportamento Esperado:** Retorno do _hasContext = false_ e nenhuma invenção gerada pelo LLM.
