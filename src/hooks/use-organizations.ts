'use client';

import { api } from '@/trpc/react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import type { OrganizationType, OrganizationStatus } from '@prisma/client';

/**
 * Hook principal pour la gestion des organisations avec optimistic updates
 */
export function useOrganizations(options?: {
  search?: string;
  type?: OrganizationType[];
  status?: OrganizationStatus[];
  countryId?: string;
  page?: number;
  limit?: number;
}) {
  const { toast } = useToast();
  const utils = api.useUtils();

  // Query pour récupérer la liste des organisations
  const organizationsQuery = api.organizations.getList.useQuery(options, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Mutation pour créer une organisation
  const createOrganizationMutation = api.organizations.create.useMutation({
    onMutate: async (newOrganization) => {
      // Annuler les requêtes en cours
      await utils.organizations.getList.cancel();

      // Snapshot des données précédentes
      const previousData = utils.organizations.getList.getData(options);

      // Optimistically update
      if (previousData) {
        const optimisticOrganization = {
          id: `temp-${Date.now()}`,
          name: newOrganization.name,
          type: newOrganization.type,
          status: newOrganization.status,
          logo: null,
          metadata: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          countries: [],
          _count: {
            services: 0,
            agents: 0,
          },
        };

        utils.organizations.getList.setData(options, {
          ...previousData,
          items: [optimisticOrganization, ...previousData.items],
          total: previousData.total + 1,
        });
      }

      return { previousData };
    },
    onError: (error, newOrganization, context) => {
      // Rollback en cas d'erreur
      if (context?.previousData) {
        utils.organizations.getList.setData(options, context.previousData);
      }

      toast({
        title: 'Erreur lors de la création',
        description:
          error.message ||
          "Une erreur est survenue lors de la création de l'organisation.",
        variant: 'destructive',
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Organisation créée avec succès',
        description: `L'organisation ${data.name} a été créée.`,
      });
    },
    onSettled: () => {
      // Invalider et refetch
      utils.organizations.getList.invalidate();
      utils.organizations.getStats.invalidate();
    },
  });

  // Mutation pour mettre à jour une organisation
  const updateOrganizationMutation = api.organizations.update.useMutation({
    onMutate: async ({ id, data: updateData }) => {
      await utils.organizations.getList.cancel();
      await utils.organizations.getById.cancel({ id });

      const previousListData = utils.organizations.getList.getData(options);
      const previousOrganizationData = utils.organizations.getById.getData({ id });

      // Update dans la liste
      if (previousListData) {
        const updatedItems = previousListData.items.map((item) =>
          item.id === id ? { ...item, ...updateData } : item,
        );

        utils.organizations.getList.setData(options, {
          ...previousListData,
          items: updatedItems,
        });
      }

      // Update dans le détail
      if (previousOrganizationData) {
        utils.organizations.getById.setData(
          { id },
          {
            ...previousOrganizationData,
            ...updateData,
          },
        );
      }

      return { previousListData, previousOrganizationData };
    },
    onError: (error, { id }, context) => {
      // Rollback
      if (context?.previousListData) {
        utils.organizations.getList.setData(options, context.previousListData);
      }
      if (context?.previousOrganizationData) {
        utils.organizations.getById.setData({ id }, context.previousOrganizationData);
      }

      toast({
        title: 'Erreur lors de la mise à jour',
        description:
          error.message ||
          "Une erreur est survenue lors de la mise à jour de l'organisation.",
        variant: 'destructive',
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Organisation mise à jour',
        description: `L'organisation ${data.name} a été mise à jour avec succès.`,
      });
    },
    onSettled: () => {
      utils.organizations.getList.invalidate();
      utils.organizations.getStats.invalidate();
    },
  });

  // Mutation pour mettre à jour le statut
  const updateStatusMutation = api.organizations.updateStatus.useMutation({
    onMutate: async ({ id, status }) => {
      await utils.organizations.getList.cancel();
      await utils.organizations.getById.cancel({ id });

      const previousListData = utils.organizations.getList.getData(options);
      const previousOrganizationData = utils.organizations.getById.getData({ id });

      // Update dans la liste
      if (previousListData) {
        const updatedItems = previousListData.items.map((item) =>
          item.id === id ? { ...item, status } : item,
        );

        utils.organizations.getList.setData(options, {
          ...previousListData,
          items: updatedItems,
        });
      }

      // Update dans le détail
      if (previousOrganizationData) {
        utils.organizations.getById.setData(
          { id },
          {
            ...previousOrganizationData,
            status,
          },
        );
      }

      return { previousListData, previousOrganizationData };
    },
    onError: (error, { id }, context) => {
      // Rollback
      if (context?.previousListData) {
        utils.organizations.getList.setData(options, context.previousListData);
      }
      if (context?.previousOrganizationData) {
        utils.organizations.getById.setData({ id }, context.previousOrganizationData);
      }

      toast({
        title: 'Erreur lors de la mise à jour du statut',
        description:
          error.message || 'Une erreur est survenue lors de la mise à jour du statut.',
        variant: 'destructive',
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Statut mis à jour',
        description: `Le statut de l'organisation ${data.name} a été mis à jour.`,
      });
    },
    onSettled: () => {
      utils.organizations.getList.invalidate();
      utils.organizations.getStats.invalidate();
    },
  });

  // Mutation pour supprimer une organisation
  const deleteOrganizationMutation = api.organizations.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.organizations.getList.cancel();

      const previousData = utils.organizations.getList.getData(options);

      // Retirer optimistiquement de la liste
      if (previousData) {
        const filteredItems = previousData.items.filter((item) => item.id !== id);
        utils.organizations.getList.setData(options, {
          ...previousData,
          items: filteredItems,
          total: previousData.total - 1,
        });
      }

      return { previousData };
    },
    onError: (error, { id }, context) => {
      // Rollback
      if (context?.previousData) {
        utils.organizations.getList.setData(options, context.previousData);
      }

      toast({
        title: 'Erreur lors de la suppression',
        description:
          error.message ||
          "Une erreur est survenue lors de la suppression de l'organisation.",
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Organisation supprimée',
        description: "L'organisation a été supprimée avec succès.",
      });
    },
    onSettled: () => {
      utils.organizations.getList.invalidate();
      utils.organizations.getStats.invalidate();
    },
  });

  return {
    // Data
    organizations: organizationsQuery.data?.items ?? [],
    total: organizationsQuery.data?.total ?? 0,
    pages: organizationsQuery.data?.pages ?? 0,
    currentPage: organizationsQuery.data?.currentPage ?? 1,

    // Loading states
    isLoading: organizationsQuery.isLoading,
    isError: organizationsQuery.isError,
    error: organizationsQuery.error,

    // Mutations
    createOrganization: createOrganizationMutation.mutate,
    updateOrganization: updateOrganizationMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    deleteOrganization: deleteOrganizationMutation.mutate,

    // Mutation states
    isCreating: createOrganizationMutation.isPending,
    isUpdating: updateOrganizationMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isDeleting: deleteOrganizationMutation.isPending,

    // Utils
    refetch: organizationsQuery.refetch,
    invalidate: () => utils.organizations.getList.invalidate(),
  };
}

/**
 * Hook pour récupérer une organisation spécifique
 */
export function useOrganization(id: string) {
  const organizationQuery = api.organizations.getById.useQuery(
    { id },
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (error.data?.code === 'NOT_FOUND') return false;
        return failureCount < 3;
      },
    },
  );

  return {
    organization: organizationQuery.data,
    isLoading: organizationQuery.isLoading,
    isError: organizationQuery.isError,
    error: organizationQuery.error,
    refetch: organizationQuery.refetch,
  };
}

/**
 * Hook pour les statistiques des organisations
 */
export function useOrganizationsStats() {
  const statsQuery = api.organizations.getStats.useQuery(undefined, {
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  return {
    stats: statsQuery.data,
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
}

/**
 * Hook pour les paramètres d'une organisation
 */
export function useOrganizationSettings(id: string) {
  const { toast } = useToast();
  const utils = api.useUtils();

  const updateSettingsMutation = api.organizations.updateSettings.useMutation({
    onMutate: async ({ id, data }) => {
      await utils.organizations.getById.cancel({ id });

      const previousData = utils.organizations.getById.getData({ id });

      // Update optimistique
      if (previousData) {
        utils.organizations.getById.setData(
          { id },
          {
            ...previousData,
            ...data,
          },
        );
      }

      return { previousData };
    },
    onError: (error, { id }, context) => {
      // Rollback
      if (context?.previousData) {
        utils.organizations.getById.setData({ id }, context.previousData);
      }

      toast({
        title: 'Erreur lors de la mise à jour',
        description:
          error.message ||
          'Une erreur est survenue lors de la mise à jour des paramètres.',
        variant: 'destructive',
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Paramètres mis à jour',
        description: `Les paramètres de l'organisation ${data.name} ont été mis à jour.`,
      });
    },
    onSettled: () => {
      utils.organizations.getById.invalidate({ id });
      utils.organizations.getList.invalidate();
    },
  });

  return {
    updateSettings: updateSettingsMutation.mutate,
    updateSettingsAsync: updateSettingsMutation.mutateAsync,
    isUpdating: updateSettingsMutation.isPending,
    error: updateSettingsMutation.error,
  };
}

/**
 * Hook pour les actions de création avec navigation
 */
export function useOrganizationCreation() {
  const { toast } = useToast();
  const router = useRouter();
  const utils = api.useUtils();

  const createMutation = api.organizations.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Organisation créée avec succès',
        description: `L'organisation ${data.name} a été créée.`,
      });

      // Invalider les caches
      utils.organizations.getList.invalidate();
      utils.organizations.getStats.invalidate();

      // Naviguer vers la page des organisations
      router.push(ROUTES.sa.organizations);
    },
    onError: (error) => {
      toast({
        title: 'Erreur lors de la création',
        description:
          error.message ||
          "Une erreur est survenue lors de la création de l'organisation.",
        variant: 'destructive',
      });
    },
  });

  return {
    createOrganization: createMutation.mutate,
    createOrganizationAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    error: createMutation.error,
  };
}

/**
 * Hook pour récupérer une organisation par pays
 */
export function useOrganizationByCountry(countryCode: string) {
  const organizationQuery = api.organizations.getByCountry.useQuery(
    { countryCode },
    {
      enabled: !!countryCode,
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  );

  return {
    organization: organizationQuery.data,
    isLoading: organizationQuery.isLoading,
    isError: organizationQuery.isError,
    error: organizationQuery.error,
    refetch: organizationQuery.refetch,
  };
}
