import { DocumentParser, ParsedChunk } from './types';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

// Sometimes pdf-parse exports as default, sometimes not depending on module resolution
const pdf = pdfParse.default || pdfParse;

export class PdfParser implements DocumentParser {
  async parse(buffer: Buffer, filename: string): Promise<ParsedChunk[]> {
    const data = await pdf(buffer);
    const text: string = data.text;

    // Separa por parágrafos duplos (quebra de bloco)
    const rawChunks: string[] = text.split(/\n\s*\n/);

    const validChunks = rawChunks
      .map((c: string) => c.trim())
      .filter((c: string) => c.length > 50);

    return validChunks.map((content, index) => ({
      content,
      metadata: {
        source: filename,
        title: filename.replace(/\.pdf$/i, ''),
        chunkIndex: index + 1,
      },
    }));
  }
}
