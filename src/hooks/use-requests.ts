'use client';

import { api } from '@/trpc/react';
import { RequestStatus, ServicePriority, ServiceCategory } from '@prisma/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Types pour les filtres
export interface RequestFilters {
  search?: string;
  status?: RequestStatus[];
  priority?: ServicePriority[];
  serviceCategory?: ServiceCategory[];
  assignedToId?: string[];
  organizationId?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Hook principal pour la gestion des demandes
export function useRequests(filters?: RequestFilters) {
  const utils = api.useUtils();

  // Récupérer la liste des demandes
  const requestsQuery = api.requests.getList.useQuery({
    search: filters?.search,
    status: filters?.status,
    priority: filters?.priority,
    serviceCategory: filters?.serviceCategory,
    assignedToId: filters?.assignedToId,
    organizationId: filters?.organizationId,
    page: filters?.page ?? 1,
    limit: filters?.limit ?? 10,
    sortBy: filters?.sortBy ?? 'createdAt',
    sortOrder: filters?.sortOrder ?? 'desc',
  });

  // Assigner une demande
  const assignMutation = api.requests.assign.useMutation({
    onSuccess: (data) => {
      toast.success('Demande assignée avec succès');
      utils.requests.getList.invalidate();
      utils.requests.getById.invalidate({ id: data.data.id });
    },
    onError: (error) => {
      toast.error(`Erreur lors de l'assignation: ${error.message}`);
    },
  });

  // Réassigner une demande
  const reassignMutation = api.requests.reassign.useMutation({
    onSuccess: () => {
      toast.success('Demande réassignée avec succès');
      utils.requests.getList.invalidate();
      utils.dashboard.getManagerStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Erreur lors de la réassignation: ${error.message}`);
    },
  });

  // Mettre à jour le statut
  const updateStatusMutation = api.requests.updateStatus.useMutation({
    onMutate: async (variables) => {
      // Optimistic update
      await utils.requests.getList.cancel();
      const previousData = utils.requests.getList.getData();

      utils.requests.getList.setData(
        {
          page: filters?.page ?? 1,
          limit: filters?.limit ?? 10,
          search: filters?.search,
          status: filters?.status,
          priority: filters?.priority,
          serviceCategory: filters?.serviceCategory,
          assignedToId: filters?.assignedToId,
          organizationId: filters?.organizationId,
          sortBy: filters?.sortBy ?? 'createdAt',
          sortOrder: filters?.sortOrder ?? 'desc',
        },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === variables.requestId
                ? { ...item, status: variables.status }
                : item,
            ),
          };
        },
      );

      return { previousData };
    },
    onSuccess: (data) => {
      toast.success('Statut mis à jour avec succès');
      utils.requests.getById.invalidate({ id: data.data.id });
      utils.dashboard.getAdminStats.invalidate();
      utils.dashboard.getAgentStats.invalidate();
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        utils.requests.getList.setData(
          {
            page: filters?.page ?? 1,
            limit: filters?.limit ?? 10,
            search: filters?.search,
            status: filters?.status,
            priority: filters?.priority,
            serviceCategory: filters?.serviceCategory,
            assignedToId: filters?.assignedToId,
            organizationId: filters?.organizationId,
            sortBy: filters?.sortBy ?? 'createdAt',
            sortOrder: filters?.sortOrder ?? 'desc',
          },
          context.previousData,
        );
      }
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    },
    onSettled: () => {
      utils.requests.getList.invalidate();
    },
  });

  // Mettre à jour une demande
  const updateMutation = api.requests.update.useMutation({
    onSuccess: () => {
      toast.success('Demande mise à jour avec succès');
      utils.requests.getList.invalidate();
    },
    onError: (error) => {
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    },
  });

  // Valider une inscription consulaire
  const validateConsularMutation = api.requests.validateConsularRegistration.useMutation({
    onSuccess: () => {
      toast.success('Inscription consulaire validée avec succès');
      utils.requests.getList.invalidate();
      utils.dashboard.getAdminStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Erreur lors de la validation: ${error.message}`);
    },
  });

  // Démarrer la production de carte
  const startCardProductionMutation = api.requests.startCardProduction.useMutation({
    onSuccess: () => {
      toast.success('Production de carte démarrée');
      utils.requests.getList.invalidate();
    },
    onError: (error) => {
      toast.error(`Erreur lors du démarrage: ${error.message}`);
    },
  });

  return {
    // Queries
    requests: requestsQuery.data,
    isLoading: requestsQuery.isLoading,
    error: requestsQuery.error,

    // Mutations
    assign: assignMutation.mutate,
    reassign: reassignMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    update: updateMutation.mutate,
    validateConsular: validateConsularMutation.mutate,
    startCardProduction: startCardProductionMutation.mutate,

    // States
    isAssigning: assignMutation.isPending,
    isReassigning: reassignMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isUpdating: updateMutation.isPending,
    isValidating: validateConsularMutation.isPending,
    isStartingProduction: startCardProductionMutation.isPending,

    // Helpers
    refetch: requestsQuery.refetch,
    invalidate: () => utils.requests.getList.invalidate(),
  };
}

// Hook pour une demande spécifique
export function useRequest(id: string) {
  const utils = api.useUtils();

  const requestQuery = api.requests.getById.useQuery({ id }, { enabled: !!id });

  const actionHistoryQuery = api.requests.getActionHistory.useQuery(
    { requestId: id },
    { enabled: !!id },
  );

  const notesQuery = api.requests.getNotes.useQuery(
    { requestId: id },
    {
      enabled: !!id,
    },
  );

  // Ajouter une note
  const addNoteMutation = api.requests.addNote.useMutation({
    onSuccess: () => {
      toast.success('Note ajoutée avec succès');
      utils.requests.getNotes.invalidate({ requestId: id });
    },
    onError: (error) => {
      toast.error(`Erreur lors de l'ajout de la note: ${error.message}`);
    },
  });

  return {
    // Queries
    request: requestQuery.data,
    actionHistory: actionHistoryQuery.data,
    notes: notesQuery.data,

    // Loading states
    isLoading: requestQuery.isLoading,
    isLoadingHistory: actionHistoryQuery.isLoading,
    isLoadingNotes: notesQuery.isLoading,

    // Errors
    error: requestQuery.error,

    // Mutations
    addNote: addNoteMutation.mutate,
    isAddingNote: addNoteMutation.isPending,

    // Helpers
    refetch: requestQuery.refetch,
  };
}

// Hook pour les demandes d'un utilisateur
export function useUserRequests(userId: string) {
  const userRequestsQuery = api.requests.getByUser.useQuery(
    { userId },
    {
      enabled: !!userId,
    },
  );

  return {
    requests: userRequestsQuery.data,
    isLoading: userRequestsQuery.isLoading,
    error: userRequestsQuery.error,
    refetch: userRequestsQuery.refetch,
  };
}

// Hook pour les statistiques des demandes
export function useRequestStats(options?: {
  organizationId?: string;
  agentId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const statsQuery = api.requests.getStatusStats.useQuery({
    organizationId: options?.organizationId,
    agentId: options?.agentId,
    startDate: options?.startDate,
    endDate: options?.endDate,
  });

  return {
    stats: statsQuery.data,
    isLoading: statsQuery.isLoading,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
}

// Hook pour les actions de validation spécifiques
export function useRequestValidation() {
  const utils = api.useUtils();
  const router = useRouter();

  // Validation d'inscription consulaire
  const validateConsularMutation = api.requests.validateConsularRegistration.useMutation({
    onSuccess: () => {
      toast.success('Inscription consulaire validée avec succès');
      utils.requests.getList.invalidate();
      utils.dashboard.getAdminStats.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Erreur lors de la validation: ${error.message}`);
    },
  });

  // Mise à jour du statut consulaire
  const updateConsularStatusMutation = api.requests.updateConsularStatus.useMutation({
    onSuccess: () => {
      toast.success('Statut consulaire mis à jour');
      utils.requests.getList.invalidate();
    },
    onError: (error) => {
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    },
  });

  // Validation d'inscription générale
  const validateRegistrationMutation = api.requests.validateRegistration.useMutation({
    onSuccess: () => {
      toast.success('Inscription validée avec succès');
      utils.requests.getList.invalidate();
      utils.dashboard.getAdminStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Erreur lors de la validation: ${error.message}`);
    },
  });

  return {
    validateConsular: validateConsularMutation.mutate,
    updateConsularStatus: updateConsularStatusMutation.mutate,
    validateRegistration: validateRegistrationMutation.mutate,

    isValidatingConsular: validateConsularMutation.isPending,
    isUpdatingConsularStatus: updateConsularStatusMutation.isPending,
    isValidatingRegistration: validateRegistrationMutation.isPending,
  };
}
