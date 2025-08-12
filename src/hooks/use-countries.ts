'use client';

import { api } from '@/trpc/react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';

/**
 * Hook principal pour la gestion des pays avec optimistic updates
 */
export function useCountries(options?: {
  search?: string;
  status?: Array<'ACTIVE' | 'INACTIVE'>;
  page?: number;
  limit?: number;
}) {
  const { toast } = useToast();
  const utils = api.useUtils();

  // Query pour récupérer la liste des pays
  const countriesQuery = api.countries.getList.useQuery(options);

  // Mutation pour créer un pays
  const createCountryMutation = api.countries.create.useMutation({
    onMutate: async (newCountry) => {
      // Annuler les requêtes en cours
      await utils.countries.getList.cancel();

      // Snapshot des données précédentes
      const previousData = utils.countries.getList.getData(options);

      // Optimistically update
      if (previousData) {
        const optimisticCountry = {
          id: `temp-${Date.now()}`,
          name: newCountry.name,
          code: newCountry.code.toUpperCase(),
          status: newCountry.status || 'ACTIVE',
          flag: newCountry.flag ?? null,
          metadata: newCountry.metadata ? JSON.stringify(newCountry.metadata) : null,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: {
            organizations: 0,
            users: 0,
          },
        };

        utils.countries.getList.setData(options, {
          ...previousData,
          items: [optimisticCountry, ...previousData.items],
          total: previousData.total + 1,
        });
      }

      return { previousData };
    },
    onError: (error, newCountry, context) => {
      // Rollback en cas d'erreur
      if (context?.previousData) {
        utils.countries.getList.setData(options, context.previousData);
      }

      toast({
        title: 'Erreur lors de la création',
        description:
          error.message || 'Une erreur est survenue lors de la création du pays.',
        variant: 'destructive',
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Pays créé avec succès',
        description: `Le pays ${data.name} a été créé.`,
      });
    },
    onSettled: () => {
      // Invalider et refetch
      utils.countries.getList.invalidate();
      utils.countries.getStats.invalidate();
    },
  });

  // Mutation pour mettre à jour un pays
  const updateCountryMutation = api.countries.update.useMutation({
    onMutate: async ({ id, ...updateData }) => {
      await utils.countries.getList.cancel();
      await utils.countries.getById.cancel({ id });

      const previousListData = utils.countries.getList.getData(options);
      const previousCountryData = utils.countries.getById.getData({ id });

      // Update dans la liste
      if (previousListData) {
        const updatedItems = previousListData.items.map((item) =>
          item.id === id ? { ...item, ...updateData } : item,
        );

        utils.countries.getList.setData(options, {
          ...previousListData,
          items: updatedItems,
        });
      }

      // Update dans le détail
      if (previousCountryData) {
        utils.countries.getById.setData(
          { id },
          {
            ...previousCountryData,
            ...updateData,
          },
        );
      }

      return { previousListData, previousCountryData };
    },
    onError: (error, { id }, context) => {
      // Rollback
      if (context?.previousListData) {
        utils.countries.getList.setData(options, context.previousListData);
      }
      if (context?.previousCountryData) {
        utils.countries.getById.setData({ id }, context.previousCountryData);
      }

      toast({
        title: 'Erreur lors de la mise à jour',
        description:
          error.message || 'Une erreur est survenue lors de la mise à jour du pays.',
        variant: 'destructive',
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Pays mis à jour',
        description: `Le pays ${data.name} a été mis à jour avec succès.`,
      });
    },
    onSettled: () => {
      utils.countries.getList.invalidate();
      utils.countries.getStats.invalidate();
    },
  });

  // Mutation pour supprimer un pays
  const deleteCountryMutation = api.countries.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.countries.getList.cancel();

      const previousData = utils.countries.getList.getData(options);

      // Retirer optimistiquement de la liste
      if (previousData) {
        const filteredItems = previousData.items.filter((item) => item.id !== id);
        utils.countries.getList.setData(options, {
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
        utils.countries.getList.setData(options, context.previousData);
      }

      toast({
        title: 'Erreur lors de la suppression',
        description:
          error.message || 'Une erreur est survenue lors de la suppression du pays.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Pays supprimé',
        description: 'Le pays a été supprimé avec succès.',
      });
    },
    onSettled: () => {
      utils.countries.getList.invalidate();
      utils.countries.getStats.invalidate();
    },
  });

  return {
    // Data
    countries: countriesQuery.data?.items ?? [],
    total: countriesQuery.data?.total ?? 0,
    pages: countriesQuery.data?.pages ?? 0,
    currentPage: countriesQuery.data?.currentPage ?? 1,

    // Loading states
    isLoading: countriesQuery.isLoading,
    isError: countriesQuery.isError,
    error: countriesQuery.error,

    // Mutations
    createCountry: createCountryMutation.mutate,
    updateCountry: updateCountryMutation.mutate,
    deleteCountry: deleteCountryMutation.mutate,

    // Mutation states
    isCreating: createCountryMutation.isPending,
    isUpdating: updateCountryMutation.isPending,
    isDeleting: deleteCountryMutation.isPending,

    // Utils
    refetch: countriesQuery.refetch,
    invalidate: () => utils.countries.getList.invalidate(),
  };
}

/**
 * Hook pour récupérer un pays spécifique
 */
export function useCountry(id: string) {
  const countryQuery = api.countries.getById.useQuery({ id }, { enabled: !!id });

  return {
    country: countryQuery.data,
    isLoading: countryQuery.isLoading,
    isError: countryQuery.isError,
    error: countryQuery.error,
    refetch: countryQuery.refetch,
  };
}

/**
 * Hook pour récupérer les pays actifs (pour les formulaires)
 */
export function useActiveCountries(organizationId?: string) {
  const activeCountriesQuery = api.countries.getActive.useQuery(
    organizationId ? { organizationId } : undefined,
  );

  return {
    countries: activeCountriesQuery.data ?? [],
    isLoading: activeCountriesQuery.isLoading,
    isError: activeCountriesQuery.isError,
    error: activeCountriesQuery.error,
    refetch: activeCountriesQuery.refetch,
  };
}

/**
 * Hook pour les statistiques des pays
 */
export function useCountriesStats() {
  const statsQuery = api.countries.getStats.useQuery(undefined);

  return {
    stats: statsQuery.data,
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
}

/**
 * Hook pour les actions de création avec navigation
 */
export function useCountryCreation() {
  const { toast } = useToast();
  const router = useRouter();
  const utils = api.useUtils();

  const createMutation = api.countries.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Pays créé avec succès',
        description: `Le pays ${data.name} a été créé.`,
      });

      // Invalider les caches
      utils.countries.getList.invalidate();
      utils.countries.getStats.invalidate();

      // Naviguer vers la page d'édition ou la liste
      router.push(ROUTES.sa.countries);
    },
    onError: (error) => {
      toast({
        title: 'Erreur lors de la création',
        description:
          error.message || 'Une erreur est survenue lors de la création du pays.',
        variant: 'destructive',
      });
    },
  });

  return {
    createCountry: createMutation.mutate,
    createCountryAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    error: createMutation.error,
  };
}

/**
 * Hook pour les actions de mise à jour avec navigation
 */
export function useCountryUpdate(id: string) {
  const { toast } = useToast();
  const router = useRouter();
  const utils = api.useUtils();

  const updateMutation = api.countries.update.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Pays mis à jour',
        description: `Le pays ${data.name} a été mis à jour avec succès.`,
      });

      // Invalider les caches
      utils.countries.getList.invalidate();
      utils.countries.getById.invalidate({ id });
      utils.countries.getStats.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Erreur lors de la mise à jour',
        description:
          error.message || 'Une erreur est survenue lors de la mise à jour du pays.',
        variant: 'destructive',
      });
    },
  });

  return {
    updateCountry: updateMutation.mutate,
    updateCountryAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    error: updateMutation.error,
  };
}
