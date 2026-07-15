import { RagResponsePayload } from '@/features/rag/schemas/rag-response-schema';

export interface Conversation {
  id: string;
  userId?: string;
  organizationId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  status: 'streaming' | 'completed' | 'error';
  sources?: RagResponsePayload['sources'];
  retrievalScore?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
