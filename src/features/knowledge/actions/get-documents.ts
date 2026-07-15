'use server';

import { documentService } from '../services/document-service';

import { auth } from '@/auth';

export async function getDocumentsAction() {
  const session = await auth();
  if (!session?.user) {
    return [];
  }

  try {
    return await documentService.listDocuments(session.user.organizationId);
  } catch (error) {
    console.error('[GetDocumentsAction] Erro:', error);
    return [];
  }
}
