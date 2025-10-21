'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import type { Id } from '@/convex/_generated/dataModel';
import { useMemo } from 'react';
import { CountryStatus } from '@/convex/lib/constants';

/**
 * Hook principal pour la gestion des pays avec Convex
 */
export function useCountries(options?: {
  search?: string;
  status?: Array<CountryStatus>;
  page?: number;
  limit?: number;
}) {
  // Fetch all countries with counts
  const allCountries = useQuery(api.functions.country.getCountryListingItems, {
    status: options?.status ? options.status[0] : undefined,
    limit: options?.limit,
  });

  // Mutations
  const createCountryMutation = useMutation(api.functions.country.createCountry);
  const updateCountryMutation = useMutation(api.functions.country.updateCountry);
  const deleteCountryMutation = useMutation(api.functions.country.deleteCountry);

  // Client-side filtering
  const filteredCountries = useMemo(() => {
    if (!allCountries) return undefined;

    let result = allCountries;

    // Filter by status
    if (options?.status && options.status.length > 0) {
      result = result.filter((country) => options.status?.includes(country.status));
    }

    // Search by name or code
    if (options?.search) {
      const search = options.search.toLowerCase();
      result = result.filter(
        (country) =>
          country.name.toLowerCase().includes(search) ||
          country.code.toLowerCase().includes(search),
      );
    }

    return result;
  }, [allCountries, options?.status, options?.search]);

  // Client-side pagination
  const paginatedCountries = useMemo(() => {
    if (!filteredCountries) return undefined;

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const start = (page - 1) * limit;

    return filteredCountries.slice(start, start + limit);
  }, [filteredCountries, options?.page, options?.limit]);

  const total = filteredCountries?.length || 0;
  const limit = options?.limit || 10;
  const pages = Math.ceil(total / limit);

  // Wrapper functions with toast notifications
  const createCountry = async (data: {
    name: string;
    code: string;
    flag?: string;
    status?: CountryStatus;
  }) => {
    try {
      await createCountryMutation(data);
      toast.success(`Le pays ${data.name} a été créé.`);
    } catch (error) {
      toast.error(
        (error as Error).message ||
          'Une erreur est survenue lors de la création du pays.',
      );
      throw error;
    }
  };

  const updateCountry = async (data: {
    countryId: Id<'countries'>;
    name?: string;
    code?: string;
    flag?: string;
    status?: string;
  }) => {
    try {
      await updateCountryMutation(data);
      toast.success(`Le pays a été mis à jour avec succès.`);
    } catch (error) {
      toast.error(
        (error as Error).message ||
          'Une erreur est survenue lors de la mise à jour du pays.',
      );
      throw error;
    }
  };

  const deleteCountry = async (countryId: Id<'countries'>) => {
    try {
      await deleteCountryMutation({ countryId });
      toast.success('Le pays a été supprimé avec succès.');
    } catch (error) {
      toast.error(
        (error as Error).message ||
          'Une erreur est survenue lors de la suppression du pays.',
      );
      throw error;
    }
  };

  return {
    // Data
    countries: paginatedCountries ?? [],
    total,
    pages,
    currentPage: options?.page || 1,

    // Loading states
    isLoading: allCountries === undefined,
    isError: false,
    error: null,

    // Mutations
    createCountry,
    updateCountry,
    deleteCountry,

    // Mutation states (Convex doesn't expose loading states the same way)
    isCreating: false,
    isUpdating: false,
    isDeleting: false,

    // Utils
    refetch: () => {}, // Convex auto-refetches
    invalidate: () => {}, // Convex auto-invalidates
  };
}

/**
 * Hook pour récupérer les pays actifs (pour les formulaires)
 */
export function useActiveCountries() {
  const countries = useQuery(api.functions.country.getAllCountries, {
    status: CountryStatus.Active,
  });

  return {
    countries: countries ?? [],
    isLoading: countries === undefined,
    isError: false,
    error: null,
    refetch: () => {}, // Convex auto-refetches
  };
}

/**
 * Hook simple pour la liste des pays (alternative)
 */
export function useCountriesList() {
  const countries = useQuery(api.functions.country.getAllCountries, {
    status: CountryStatus.Active,
  });

  return {
    countries: countries ?? [],
    isLoading: countries === undefined,
    isError: false,
    error: null,
  };
}
