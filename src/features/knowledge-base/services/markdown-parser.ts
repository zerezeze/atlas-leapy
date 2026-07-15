import { KnowledgeDocument, DocumentMetadata } from '../types';
import crypto from 'crypto';

/**
 * A simple markdown parser that prepares the document for the knowledge base.
 * Prepared for future extensions (e.g., frontmatter parsing, section splitting/chunking).
 */
export function parseMarkdown(
  rawContent: string,
  fileName: string,
  stats: { createdAt: Date; updatedAt: Date }
): KnowledgeDocument {
  // Simple title extraction: Find the first heading 1 (# Title)
  const titleMatch = rawContent.match(/^#\s+(.+)$/m);
  const title = titleMatch
    ? titleMatch[1].trim()
    : fileName.replace(/\.md$/, '');

  const metadata: DocumentMetadata = {
    title,
    source: fileName,
    createdAt: stats.createdAt,
    updatedAt: stats.updatedAt,
  };

  // Generate a deterministic ID based on the file name
  const id = crypto.createHash('sha256').update(fileName).digest('hex');

  return {
    id,
    title,
    source: fileName,
    content: rawContent,
    metadata,
  };
}
