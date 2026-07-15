import { DocumentParser, ParsedChunk } from './types';

export class MarkdownParser implements DocumentParser {
  async parse(buffer: Buffer, filename: string): Promise<ParsedChunk[]> {
    const text = buffer.toString('utf-8');

    // Separa por seções usando cabeçalhos (## ou #)
    // Uma abordagem simplificada de chunking
    const rawChunks = text.split(/(?=^#{1,3}\s)/m);

    const validChunks = rawChunks
      .map((c) => c.trim())
      .filter((c) => c.length > 50); // Ignora chunks vazios ou muito curtos

    return validChunks.map((content, index) => ({
      content,
      metadata: {
        source: filename,
        title: filename.replace('.md', ''),
        chunkIndex: index + 1,
      },
    }));
  }
}
