import { DocumentParser, ParsedChunk } from './types';

export class TextParser implements DocumentParser {
  async parse(buffer: Buffer, filename: string): Promise<ParsedChunk[]> {
    const text = buffer.toString('utf-8');

    // Separa por parágrafos duplos (quebra de bloco)
    const rawChunks = text.split(/\n\s*\n/);

    const validChunks = rawChunks
      .map((c) => c.trim())
      .filter((c) => c.length > 50);

    return validChunks.map((content, index) => ({
      content,
      metadata: {
        source: filename,
        title: filename.replace('.txt', ''),
        chunkIndex: index + 1,
      },
    }));
  }
}
