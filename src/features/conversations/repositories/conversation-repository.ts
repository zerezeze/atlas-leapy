import { getSupabaseAdminClient } from '@/lib/supabase/client';
import { Conversation, ConversationMessage } from '../types/conversation';
import { RagResponsePayload } from '@/features/rag/schemas/rag-response-schema';

export class ConversationRepository {
  async createConversation(
    title: string,
    organizationId: string,
    userId?: string
  ): Promise<Conversation> {
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('conversations')
      .insert({ title, user_id: userId, organization_id: organizationId })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    return {
      id: data.id,
      title: data.title,
      userId: data.user_id,
      organizationId: data.organization_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async getConversation(
    id: string,
    organizationId: string
  ): Promise<Conversation | null> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      userId: data.user_id,
      organizationId: data.organization_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async listConversations(
    organizationId: string,
    userId?: string
  ): Promise<Conversation[]> {
    const supabase = getSupabaseAdminClient();
    let query = supabase
      .from('conversations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list conversations: ${error.message}`);
    }

    return data.map((d: Record<string, unknown>) => ({
      id: d.id as string,
      title: d.title as string,
      userId: d.user_id as string | undefined,
      organizationId: d.organization_id as string,
      createdAt: new Date(d.created_at as string),
      updatedAt: new Date(d.updated_at as string),
    }));
  }

  async getConversationMessages(
    conversationId: string
  ): Promise<ConversationMessage[]> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    return data.map((d: Record<string, unknown>) => ({
      id: d.id as string,
      conversationId: d.conversation_id as string,
      role: d.role as 'user' | 'assistant' | 'system',
      content: d.content as string,
      status: d.status as 'streaming' | 'completed' | 'error',
      sources: d.sources as RagResponsePayload['sources'],
      retrievalScore: d.retrieval_score as number | undefined,
      metadata: d.metadata as Record<string, unknown> | undefined,
      createdAt: new Date(d.created_at as string),
    }));
  }

  async addMessage(
    msg: Omit<ConversationMessage, 'id' | 'createdAt'>
  ): Promise<ConversationMessage> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: msg.conversationId,
        role: msg.role,
        content: msg.content,
        status: msg.status,
        sources: msg.sources,
        retrieval_score: msg.retrievalScore,
        metadata: msg.metadata,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert message: ${error.message}`);
    }

    return {
      id: data.id,
      conversationId: data.conversation_id,
      role: data.role,
      content: data.content,
      status: data.status,
      sources: data.sources,
      retrievalScore: data.retrieval_score,
      metadata: data.metadata,
      createdAt: new Date(data.created_at),
    };
  }
}

export const conversationRepository = new ConversationRepository();
