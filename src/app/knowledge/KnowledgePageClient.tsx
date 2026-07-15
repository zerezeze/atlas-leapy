'use client';

import { useState } from 'react';
import { UploadZone } from '@/features/knowledge/components/UploadZone';
import { KnowledgeDocumentsList } from '@/features/knowledge/components/KnowledgeDocumentsList';
import { getDocumentsAction } from '@/features/knowledge/actions/get-documents';
import { KnowledgeDocument } from '@/features/knowledge/services/document-service';
import { Database } from 'lucide-react';

export function KnowledgePageClient({
  initialDocuments,
}: {
  initialDocuments: KnowledgeDocument[];
}) {
  const [documents, setDocuments] =
    useState<KnowledgeDocument[]>(initialDocuments);
  const [loading, setLoading] = useState(false);

  const refreshDocuments = async () => {
    setLoading(true);
    const updated = await getDocumentsAction();
    setDocuments(updated);
    setLoading(false);
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col pt-8 pb-12 px-6 h-full">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <Database className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Knowledge Base
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie os documentos utilizados pelo Atlas.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <section>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-4">
            Enviar Documento
          </h2>
          <UploadZone onSuccess={refreshDocuments} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
              Documentos Indexados
            </h2>
            {loading && (
              <span className="text-xs text-zinc-500 animate-pulse">
                Atualizando...
              </span>
            )}
          </div>
          <KnowledgeDocumentsList
            documents={documents}
            onDocumentDeleted={refreshDocuments}
          />
        </section>
      </div>
    </div>
  );
}
