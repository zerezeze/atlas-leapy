import { Conversation, ConversationMessage } from '../types/conversation';
import { conversationRepository } from '../repositories/conversation-repository';
import { RagResponsePayload } from '@/features/rag/schemas/rag-response-schema';

export class ConversationService {
  async getConversation(
    id: string,
    organizationId: string
  ): Promise<Conversation | null> {
    return conversationRepository.getConversation(id, organizationId);
  }

  async listConversations(
    organizationId: string,
    userId?: string
  ): Promise<Conversation[]> {
    return conversationRepository.listConversations(organizationId, userId);
  }

  async createConversation(
    title: string,
    organizationId: string,
    userId?: string
  ): Promise<Conversation> {
    return conversationRepository.createConversation(
      title,
      organizationId,
      userId
    );
  }

  async getConversationMessages(id: string): Promise<ConversationMessage[]> {
    return conversationRepository.getConversationMessages(id);
  }

  async ensureConversation(
    organizationId: string,
    id?: string,
    firstMessageContent?: string,
    userId?: string
  ): Promise<Conversation> {
    if (id) {
      const existing = await this.getConversation(id, organizationId);
      if (existing) return existing;
    }

    // Title generation based on the first message (truncate if too long)
    const title = firstMessageContent
      ? firstMessageContent.slice(0, 40) +
        (firstMessageContent.length > 40 ? '...' : '')
      : 'Nova Conversa';

    return conversationRepository.createConversation(
      title,
      organizationId,
      userId
    );
  }

  async addMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    status: 'streaming' | 'completed' | 'error' = 'completed',
    sources?: RagResponsePayload['sources'],
    retrievalScore?: number,
    metadata?: Record<string, unknown>
  ): Promise<ConversationMessage> {
    return conversationRepository.addMessage({
      conversationId,
      role,
      content,
      status,
      sources,
      retrievalScore,
      metadata,
    });
  }
}

export const conversationService = new ConversationService();
