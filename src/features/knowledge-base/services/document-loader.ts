import fs from 'fs/promises';
import path from 'path';
import { KnowledgeDocument } from '../types';
import { parseMarkdown } from './markdown-parser';

const KB_DIR = path.join(process.cwd(), 'src/features/knowledge-base/data');

/**
 * Função recursiva para encontrar todos os arquivos dentro de subdiretórios.
 */
async function walkDir(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const res = path.resolve(dir, entry.name);
      return entry.isDirectory() ? walkDir(res) : res;
    })
  );
  return files.flat() as string[];
}

/**
 * Service responsible for loading and parsing all Markdown documents
 * from the local knowledge base directory (including nested directories).
 */
export async function loadAllDocuments(): Promise<KnowledgeDocument[]> {
  try {
    // Ensure the data directory exists
    try {
      await fs.access(KB_DIR);
    } catch {
      await fs.mkdir(KB_DIR, { recursive: true });
      return [];
    }

    const allFiles = await walkDir(KB_DIR);
    const mdFiles = allFiles.filter((file) => file.endsWith('.md'));

    const documents: KnowledgeDocument[] = [];

    for (const filePath of mdFiles) {
      const relativePath = path.relative(KB_DIR, filePath); // Ex: financeiro/planos.md
      const stats = await fs.stat(filePath);
      const rawContent = await fs.readFile(filePath, 'utf-8');

      const document = parseMarkdown(rawContent, relativePath, {
        createdAt: stats.birthtime,
        updatedAt: stats.mtime,
      });

      documents.push(document);
    }

    return documents;
  } catch (error) {
    console.error('Error loading knowledge base documents:', error);
    throw new Error('Failed to load knowledge base documents.');
  }
}
