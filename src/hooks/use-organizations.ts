'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ROUTES } from '@/schemas/routes';
import type { Id } from '@/convex/_generated/dataModel';
import {
  CountryCode,
  OrganizationStatus,
  OrganizationType,
} from '@/convex/lib/constants';

/**
 * Hook principal pour la gestion des organisations avec filtres et pagination
 */
export function useOrganizations(options?: {
  search?: string;
  type?: OrganizationType[];
  status?: OrganizationStatus[];
  page?: number;
  limit?: number;
}) {
  // Query pour récupérer la liste des organisations enrichies
  const organizationsData = useQuery(
    api.functions.organization.getOrganizationsListEnriched,
    {
      search: options?.search,
      type: options?.type,
      status: options?.status,
      page: options?.page || 1,
      limit: options?.limit || 10,
    },
  );

  // Mutation pour créer une organisation
  const createMutation = useMutation(api.functions.organization.createOrganization);

  const createOrganization = async (data: {
    name: string;
    code: CountryCode;
    type: OrganizationType;
    status?: OrganizationStatus;
    logo?: string;
    countryCodes?: CountryCode[];
  }) => {
    try {
      await createMutation({
        name: data.name,
        code: data.code,
        type: data.type,
        status: data.status || OrganizationStatus.Active,
        logo: data.logo,
        countryCodes: data.countryCodes || [],
      });

      toast.success('Organisation créée avec succès', {
        description: `L'organisation ${data.name} a été créée.`,
      });
    } catch (error) {
      toast.error('Erreur lors de la création', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue.',
      });
      throw error;
    }
  };

  // Mutation pour mettre à jour une organisation
  const updateMutation = useMutation(api.functions.organization.updateOrganization);

  const updateOrganization = async (
    organizationId: Id<'organizations'>,
    data: {
      name?: string;
      code?: string;
      type?: string;
      logo?: string;
      countryCodes?: CountryCode[];
    },
  ) => {
    try {
      await updateMutation({
        organizationId,
        name: data.name,
        code: data.code,
        type: data.type,
        logo: data.logo,
        countryCodes: data.countryCodes || [],
      });

      toast.success('Organisation mise à jour avec succès', {
        description: `L'organisation a été mise à jour avec succès.`,
      });
    } catch (error) {
      toast.error('Erreur lors de la mise à jour', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue.',
      });
      throw error;
    }
  };

  // Mutation pour mettre à jour le statut
  const updateStatusMutation = useMutation(
    api.functions.organization.updateOrganizationStatus,
  );

  const updateStatus = async (organizationId: Id<'organizations'>, status: string) => {
    try {
      await updateStatusMutation({
        organizationId,
        status,
      });

      toast.success('Statut mis à jour avec succès', {
        description: `Le statut de l'organisation a été mis à jour.`,
      });
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue.',
      });
      throw error;
    }
  };

  // Mutation pour supprimer une organisation
  const deleteMutation = useMutation(api.functions.organization.deleteOrganization);

  const deleteOrganization = async (organizationId: Id<'organizations'>) => {
    try {
      await deleteMutation({
        organizationId,
      });

      toast.success('Organisation supprimée avec succès', {
        description: "L'organisation a été supprimée avec succès.",
      });
    } catch (error) {
      toast.error('Erreur lors de la suppression', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue.',
      });
      throw error;
    }
  };

  return {
    // Data
    organizations: organizationsData?.organizations ?? [],
    total: organizationsData?.total ?? 0,
    pages: organizationsData
      ? Math.ceil(organizationsData.total / (organizationsData.limit || 10))
      : 0,
    currentPage: organizationsData?.page ?? 1,

    // Loading states
    isLoading: organizationsData === undefined,
    isError: false,
    error: null,

    // Mutations
    createOrganization,
    updateOrganization,
    updateStatus,
    deleteOrganization,

    // Mutation states
    isCreating: false,
    isUpdating: false,
    isUpdatingStatus: false,
    isDeleting: false,

    // Utils
    refetch: () => {}, // Convex auto-refetches
    invalidate: () => {}, // Not needed with Convex
  };
}

/**
 * Hook pour récupérer une organisation spécifique
 */
export function useOrganization(id: Id<'organizations'>) {
  const organizationData = useQuery(api.functions.organization.getOrganization, {
    organizationId: id,
  });

  return {
    organization: organizationData,
    isLoading: organizationData === undefined,
    isError: false,
    error: null,
    refetch: () => {},
  };
}

/**
 * Hook pour les statistiques des organisations
 */
export function useOrganizationsStats() {
  const organizationsData = useQuery(api.functions.organization.getAllOrganizations, {
    limit: 1000,
  });

  return {
    stats: {
      total: organizationsData?.length || 0,
      organizations: organizationsData || [],
    },
    isLoading: organizationsData === undefined,
    isError: false,
    error: null,
    refetch: () => {},
  };
}

/**
 * Hook pour les paramètres d'une organisation
 */
export function useOrganizationSettings(id: Id<'organizations'>) {
  const updateSettingsMutation = useMutation(
    api.functions.organization.updateOrganizationSettings,
  );

  const updateSettings = async (data: any) => {
    try {
      await updateSettingsMutation({
        organizationId: id,
        settings: data,
      });

      toast.success('Paramètres mis à jour avec succès', {
        description: `Les paramètres de l'organisation ont été mis à jour.`,
      });
    } catch (error) {
      toast.error('Erreur lors de la mise à jour', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue.',
      });
      throw error;
    }
  };

  return {
    updateSettings,
    updateSettingsAsync: updateSettings,
    isUpdating: false,
    error: null,
  };
}

/**
 * Hook pour les actions de création avec navigation
 */
export function useOrganizationCreation() {
  const router = useRouter();

  const createMutation = useMutation(api.functions.organization.createOrganization);

  const create = async (data: {
    name: string;
    code: CountryCode;
    type: OrganizationType;
    status?: OrganizationStatus;
    logo?: string;
    countryCodes?: CountryCode[];
  }) => {
    try {
      await createMutation({
        name: data.name,
        code: data.code,
        type: data.type,
        status: data.status || OrganizationStatus.Active,
        logo: data.logo,
        countryCodes: data.countryCodes || [],
      });

      toast.success('Organisation créée avec succès', {
        description: `L'organisation ${data.name} a été créée.`,
      });

      // Navigate to organizations page
      router.push(ROUTES.sa.organizations);
    } catch (error) {
      toast.error('Erreur lors de la création', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue.',
      });
      throw error;
    }
  };

  return {
    createOrganization: create,
    createOrganizationAsync: create,
    isCreating: false,
    error: null,
  };
}

/**
 * Hook pour récupérer une organisation par pays
 */
export function useOrganizationByCountry(countryCode: CountryCode) {
  const organizationsData = useQuery(
    api.functions.organization.getOrganizationsByCountry,
    countryCode ? { countryCode } : 'skip',
  );

  return {
    organization: organizationsData?.[0] || null,
    isLoading: organizationsData === undefined,
    isError: false,
    error: null,
    refetch: () => {},
  };
}
