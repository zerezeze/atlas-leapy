import { MarkdownParser } from './parsers/markdown-parser';
import { TextParser } from './parsers/text-parser';
import { PdfParser } from './parsers/pdf-parser';
import { DocxParser } from './parsers/docx-parser';
import { ParsedChunk } from './parsers/types';

export class DocumentChunker {
  /**
   * Orquestra o parser adequado com base na extensão ou mime-type.
   */
  static async process(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<ParsedChunk[]> {
    const isMarkdown =
      filename.toLowerCase().endsWith('.md') || mimeType === 'text/markdown';
    const isText =
      filename.toLowerCase().endsWith('.txt') || mimeType === 'text/plain';
    const isPdf =
      filename.toLowerCase().endsWith('.pdf') || mimeType === 'application/pdf';
    const isDocx =
      filename.toLowerCase().endsWith('.docx') ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (isMarkdown) {
      const parser = new MarkdownParser();
      return parser.parse(buffer, filename);
    }

    if (isText) {
      const parser = new TextParser();
      return parser.parse(buffer, filename);
    }

    if (isPdf) {
      const parser = new PdfParser();
      return parser.parse(buffer, filename);
    }

    if (isDocx) {
      const parser = new DocxParser();
      return parser.parse(buffer, filename);
    }

    throw new Error(
      `Formato de arquivo não suportado para chunking: ${filename}`
    );
  }
}
