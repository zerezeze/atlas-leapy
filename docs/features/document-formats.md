# Formatos de Documento Suportados

A Knowledge Base do Atlas utiliza um mecanismo de abstração flexível baseado em parsers. Atualmente suportamos os seguintes formatos:

- **Markdown (.md)**
- **Text (.txt)**
- **PDF (.pdf)**
- **Word (.docx)**

## Adicionando novos Formatos (Guia do Desenvolvedor)

O sistema foi desenhado respeitando o princípio **Open/Closed**.
Isso significa que para adicionar novos formatos (como `.csv` ou `.html`), você não precisa reescrever o fluxo de Embeddings do RAG. Basta seguir estes 3 passos:

1. **Crie um Parser**
   Na pasta `src/features/knowledge/services/parsers/`, crie uma classe (ex: `CsvParser`) implementando a interface `DocumentParser`:

```typescript
import { DocumentParser, ParsedChunk } from './types';

export class CsvParser implements DocumentParser {
  async parse(buffer: Buffer, filename: string): Promise<ParsedChunk[]> {
    // 1. Extraia o texto do formato bruto
    // 2. Quebre o texto em um array de strings maiores que 50 caracteres
    // 3. Retorne mapeando para o formato ParsedChunk
  }
}
```

2. **Registre no Chunker**
   Edite `src/features/knowledge/services/document-chunker.ts`:

```typescript
const isCsv =
  filename.toLowerCase().endsWith('.csv') || mimeType === 'text/csv';

if (isCsv) {
  const parser = new CsvParser();
  return parser.parse(buffer, filename);
}
```

3. **Atualize a Validação na UI**
   Abra `src/features/knowledge/components/UploadZone.tsx` e altere a propriedade `accept` do input `<input type="file" accept=".md,.txt,.pdf,.docx,.csv" />` e também a checagem manual de extensão na função `validateAndSetFile`.
