import { getDocumentsAction } from '@/features/knowledge/actions/get-documents';
import { KnowledgePageClient } from './KnowledgePageClient';

import { BaseLayout } from '@/components/layout/BaseLayout';

export const metadata = {
  title: 'Knowledge Base | Atlas',
  description: 'Gerencie os documentos utilizados pelo Atlas.',
};

export default async function KnowledgePage() {
  const documents = await getDocumentsAction();

  return (
    <BaseLayout>
      <KnowledgePageClient initialDocuments={documents} />
    </BaseLayout>
  );
}
