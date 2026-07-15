export interface ParsedChunk {
  content: string;
  metadata: {
    source: string;
    title: string;
    chunkIndex: number;
  };
}

export interface DocumentParser {
  parse(buffer: Buffer, filename: string): Promise<ParsedChunk[]>;
}
