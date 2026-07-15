import { DocumentParser, ParsedChunk } from './types';
import mammoth from 'mammoth';

export class DocxParser implements DocumentParser {
  async parse(buffer: Buffer, filename: string): Promise<ParsedChunk[]> {
    const result = await mammoth.extractRawText({ buffer });
    const text: string = result.value;

    // Separa por parágrafos duplos (quebra de bloco)
    const rawChunks: string[] = text.split(/\n\s*\n/);

    const validChunks = rawChunks
      .map((c: string) => c.trim())
      .filter((c: string) => c.length > 50);

    return validChunks.map((content, index) => ({
      content,
      metadata: {
        source: filename,
        title: filename.replace(/\.docx$/i, ''),
        chunkIndex: index + 1,
      },
    }));
  }
}
