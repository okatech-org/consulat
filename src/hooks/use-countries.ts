'use client';

import { api } from '@/trpc/react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import type { Country } from '@/types/country';
import { getActiveCountries } from '@/actions/countries';
import { tryCatch } from '@/lib/utils';

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

export function useCountriesList() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchCountries = async () => {
      const countries = await tryCatch(getActiveCountries());

      if (countries.error) {
        setIsError(true);
        setError(countries.error);
      } else {
        setCountries(countries.data as Country[]);
      }
      setIsLoading(false);
    };
    fetchCountries();
  }, []);

  return {
    countries,
    isLoading,
    isError,
    error,
  };
}
