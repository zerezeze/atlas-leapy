export interface DocumentMetadata {
  title: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  source: string;
  content: string; // The raw markdown string
  metadata?: Record<string, unknown>; // Any additional data like author, tags, etc.
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  metadata: {
    source: string;
    title: string;
    chunkIndex: number;
    [key: string]: unknown;
  };
}
