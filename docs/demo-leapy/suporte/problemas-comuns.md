# Resolução de Problemas Comuns

## 1. O Chatbot respondeu "Não encontrei informações"

**Causa:** A IA do Atlas é travada (guardrails) para não "alucinar". Se ela responder isso, significa que a busca semântica no banco de vetores não obteve um score de relevância alto o suficiente para os documentos atuais.
**Solução:**

- Verifique se o assunto perguntado realmente está em algum documento na Knowledge Base.
- Certifique-se de que o documento terminou de ser indexado.

## 2. Erro de Upload (Arquivo Acima de 5MB)

**Causa:** A política de fair-use atual restringe arquivos únicos com mais de 5MB.
**Solução:**

- Divida o PDF em arquivos menores (Capítulo 1, Capítulo 2).
- Para clientes Enterprise, contate o CS (Customer Success) para habilitar envios paralelos de até 50MB.

## 3. O botão de "Sair" não desloga na Vercel

**Causa:** Eventualmente os cookies de sessão podem conflitar com o Cache agressivo do Next.js App Router no ambiente Serverless da Vercel.
**Solução:**

- A engenharia da Leapy já corrigiu esse problema no patch v1.0.3, utilizando a limpeza de cookies manuais através de Server Actions. Caso ocorra em instâncias antigas, faça a limpeza dos cookies via `Application > Storage` no navegador.

## 4. O Sistema não retorna Fontes (Citations)

**Causa:** Extratores corrompidos no documento original (textos em formato de imagem dentro do PDF sem OCR).
**Solução:** Envie apenas PDFs baseados em texto e não imagens escaneadas. O Atlas não realiza OCR nativo (leitura de imagens rasterizadas).
