'use server';

import { documentService } from '../services/document-service';
import { getSupabaseAdminClient } from '@/lib/supabase/client';

import { auth } from '@/auth';

export async function deleteDocumentAction(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Não autorizado.' };
  }

  try {
    const supabase = getSupabaseAdminClient();

    // 1. Deletar chunks (evitando órfãos)
    const { error: chunksError } = await supabase
      .from('knowledge_chunks')
      .delete()
      .eq('document_id', id)
      .eq('organization_id', session.user.organizationId);

    if (chunksError) {
      console.error('[DeleteAction] Falha ao deletar chunks:', chunksError);
      throw new Error('Falha ao remover indexação do documento.');
    }

    // 2. Deletar do catálogo
    await documentService.deleteDocument(id, session.user.organizationId);

    return { success: true };
  } catch (error) {
    console.error('[DeleteAction] Falha no processamento:', error);
    return { success: false, error: 'Não foi possível excluir o documento.' };
  }
}
