# ADR-006: Polimento de Produto e UX B2B

## Contexto

Após a implementação da infraestrutura robusta do RAG (Fases 1, 2 e 3 do projeto), a experiência do usuário do Atlas carecia de refinamentos condizentes com um produto SaaS Enterprise real. Como o Atlas será demonstrado em entrevistas e usado como showcase tecnológico, a interface deve refletir qualidade de produto.

## Decisão

Adotamos uma sprint dedicada exclusivamente para UX/UI (Sprint 13), com a restrição estrita de **não alterar nenhuma lógica ou contrato RAG subjacente**.

Implementações chaves decididas:

1. **Empty States Educativos**: Remoção da tela vazia árida em favor de um modal de introdução com _Suggestion Chips_ clicáveis, guiando usuários inexperientes pelo _happy path_.
2. **Design System & Hierarquia**: Utilização extensiva de contrastes reduzidos para metadados (como datas, tooltips e chunks) e separadores visuais (linhas horizontais) para demarcar limites entre as respostas do LLM e os artefatos de retrieval (fontes).
3. **Graceful Error Handling**: Erros de infraestrutura (Vercel, Supabase, OpenAI) são agora engolidos pela UI e transformados em mensagens simpáticas, incluindo um botão de "Tentar Novamente" que injeta no pipeline a última mensagem da sessão.
4. **Mobile First Drawer**: Como o layout prévio era voltado para desktops amplos, o histórico de conversas foi portado para um `Sheet` nativo (drawer animado) condicionado a telas menores, garantindo experiência 100% responsiva no celular.

## Consequências

- **Positivas**: Percepção de produto drasticamente aumentada; UX tolerante a falhas (resiliência visual); integração de documentação transparente na página institucional (`/about`).
- **Negativas**: Aumento sutil da complexidade dos componentes de front-end devido aos estados de hover, links ativos e breakpoints. Nenhuma penalidade arquitetural backend incorrida.
