'use client';

import { FileText, Trash2, RefreshCw, Eye, Loader2 } from 'lucide-react';
import { KnowledgeDocument } from '../services/document-service';
import { deleteDocumentAction } from '../actions/delete-document';
import { useState } from 'react';

interface KnowledgeDocumentsListProps {
  documents: KnowledgeDocument[];
  onDocumentDeleted: () => void;
}

export function KnowledgeDocumentsList({
  documents,
  onDocumentDeleted,
}: KnowledgeDocumentsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const result = await deleteDocumentAction(id);
    setDeletingId(null);
    if (result.success) {
      onDocumentDeleted();
    } else {
      alert('Erro ao excluir o documento.');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20">
        <FileText className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-3" />
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Nenhum documento indexado
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 text-center max-w-sm">
          Os documentos enviados aparecerão aqui e estarão imediatamente
          disponíveis para busca.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th scope="col" className="px-6 py-3 font-medium">
                Nome
              </th>
              <th scope="col" className="px-6 py-3 font-medium">
                Chunks
              </th>
              <th scope="col" className="px-6 py-3 font-medium">
                Data
              </th>
              <th scope="col" className="px-6 py-3 font-medium text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium">
                    <FileText className="h-4 w-4 text-blue-500 opacity-80" />
                    <div className="flex flex-col">
                      <span>{doc.filename}</span>
                      <span className="text-[10px] text-zinc-400 font-normal uppercase tracking-wider">
                        Tipo: {doc.filename.split('.').pop() || 'Desconhecido'}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {doc.chunk_count || 0} chunks
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-xs">
                  {formatDate(doc.created_at)}
                </td>
                <td className="px-6 py-4 flex items-center justify-end gap-2">
                  <button
                    disabled
                    title="Visualizar (Em breve)"
                    className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-50 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    disabled
                    title="Reindexar (Em breve)"
                    className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    title="Excluir documento"
                    className="p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 transition-colors"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
