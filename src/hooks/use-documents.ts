import { api } from '@/trpc/react';
import { DocumentType } from '@prisma/client';

// Hook optimisé pour les documents du dashboard avec pagination
export function useDocumentsDashboard(options?: {
  limit?: number;
  type?: DocumentType;
  enabled?: boolean;
}) {
  const limit = options?.limit ?? 20;
  const type = options?.type;
  const enabled = options?.enabled ?? true;

  return api.documents.getUserDocumentsDashboard.useInfiniteQuery(
    {
      limit,
      type,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled,
    },
  );
}

// Hook pour les statistiques des documents
export function useDocumentsStats() {
  return {
    total: 0, // À implémenter si nécessaire
    pending: 0,
    validated: 0,
    rejected: 0,
  };
}

// Hook pour la gestion des actions sur les documents
export function useDocumentsActions() {
  const utils = api.useUtils();

  const createDocument = api.documents.create.useMutation({
    onSuccess: () => {
      utils.documents.getUserDocumentsDashboard.invalidate();
      utils.user.getDocumentsCount.invalidate();
    },
  });

  const updateMetadata = api.documents.updateMetadata.useMutation({
    onSuccess: () => {
      utils.documents.getUserDocumentsDashboard.invalidate();
    },
  });

  const deleteDocument = api.documents.delete.useMutation({
    onSuccess: () => {
      utils.documents.getUserDocumentsDashboard.invalidate();
      utils.user.getDocumentsCount.invalidate();
    },
  });

  return {
    createDocument,
    updateMetadata,
    deleteDocument,
  };
}
