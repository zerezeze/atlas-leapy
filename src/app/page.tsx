import { BaseLayout } from '@/components/layout/BaseLayout';
import { ChatContainer } from '@/features/chat/components/ChatContainer';
import { getDocumentsAction } from '@/features/knowledge/actions/get-documents';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

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
        documentCount={documentCount}
        organizationSlug={org?.slug || ''}
      />
    </BaseLayout>
  );
}
