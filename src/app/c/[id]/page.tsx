import { BaseLayout } from '@/components/layout/BaseLayout';
import { ChatContainer } from '@/features/chat/components/ChatContainer';
import { conversationService } from '@/features/conversations/services/conversation-service';
import { notFound } from 'next/navigation';
import { getDocumentsAction } from '@/features/knowledge/actions/get-documents';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    notFound();
  }

  const { id } = await params;
  const conversation = await conversationService.getConversation(
    id,
    session.user.organizationId
  );

  if (!conversation) {
    notFound();
  }

  const messages = await conversationService.getConversationMessages(id);

  const mappedMessages = messages.map((m) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    status: m.status as 'streaming' | 'completed' | 'error',
    sources: m.sources,
    retrievalScore: m.retrievalScore,
    explanation: m.metadata?.explanation as string | undefined,
  }));

  const documents = await getDocumentsAction();
  const documentCount = documents.length;

  const supabase = getSupabaseAdminClient();
  const { data: org } = await supabase
    .from('organizations')
    .select('slug')
    .eq('id', session.user.organizationId)
    .single();

  return (
    <BaseLayout>
      <ChatContainer
        initialConversationId={conversation.id}
        initialMessages={mappedMessages}
        documentCount={documentCount}
        organizationSlug={org?.slug || ''}
      />
    </BaseLayout>
  );
}
