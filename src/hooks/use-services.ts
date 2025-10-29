'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import type { Id } from '@/convex/_generated/dataModel';
import { useMemo } from 'react';
import type { ServiceCategory, ServiceStatus } from '@/convex/lib/constants';
import type { ServiceStep } from '@/convex/lib/types';

/**
 * Hook principal pour la gestion des services avec Convex
 */
export function useServices(options?: {
  search?: string;
  organizationId?: Id<'organizations'> | string;
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  // Fetch all services
  const allServices = useQuery(api.functions.service.getAllServices, {});

  // Mutations
  const createServiceMutation = useMutation(api.functions.service.createService);
  const updateServiceMutation = useMutation(api.functions.service.updateService);
  const deleteServiceMutation = useMutation(api.functions.service.deleteService);

  // Client-side filtering
  const filteredServices = useMemo(() => {
    if (!allServices) return undefined;

    let result = allServices;

    // Filter by organizationId
    if (options?.organizationId) {
      result = result.filter(
        (service) =>
          service.organizationId === options.organizationId ||
          String(service.organizationId) === String(options.organizationId),
      );
    }

    // Filter by status
    if (options?.status) {
      result = result.filter((service) => service.status === options.status);
    }

    // Filter by category
    if (options?.category) {
      result = result.filter((service) => service.category === options.category);
    }

    // Search by name or code
    if (options?.search) {
      const search = options.search.toLowerCase();
      result = result.filter(
        (service) =>
          service.name.toLowerCase().includes(search) ||
          service.code.toLowerCase().includes(search),
      );
    }

    return result;
  }, [
    allServices,
    options?.organizationId,
    options?.status,
    options?.category,
    options?.search,
  ]);

  // Client-side pagination
  const paginatedServices = useMemo(() => {
    if (!filteredServices) return undefined;

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const start = (page - 1) * limit;

    return filteredServices.slice(start, start + limit);
  }, [filteredServices, options?.page, options?.limit]);

  const total = filteredServices?.length || 0;
  const limit = options?.limit || 10;
  const pages = Math.ceil(total / limit);

  // Wrapper functions with toast notifications
  const createService = async (data: {
    code: string;
    name: string;
    description?: string;
    category: ServiceCategory;
    status?: ServiceStatus;
    countries: string[];
    organizationId: Id<'organizations'> | string;
    steps: ServiceStep[];
    processing: any;
    delivery: any;
    pricing: any;
  }) => {
    try {
      const serviceId = await createServiceMutation(data);
      toast.success(`Le service ${data.name} a été créé.`);
      return serviceId;
    } catch (error) {
      toast.error(
        (error as Error).message ||
          'Une erreur est survenue lors de la création du service.',
      );
      throw error;
    }
  };

  const updateService = async (data: {
    serviceId: Id<'services'>;
    name?: string;
    code?: string;
    description?: string;
    status?: ServiceStatus;
  }) => {
    try {
      await updateServiceMutation(data);
      toast.success('Le service a été mis à jour avec succès.');
    } catch (error) {
      toast.error(
        (error as Error).message ||
          'Une erreur est survenue lors de la mise à jour du service.',
      );
      throw error;
    }
  };

  const deleteService = async (serviceId: Id<'services'>) => {
    try {
      await deleteServiceMutation({ serviceId });
      toast.success('Le service a été supprimé avec succès.');
    } catch (error) {
      toast.error(
        (error as Error).message ||
          'Une erreur est survenue lors de la suppression du service.',
      );
      throw error;
    }
  };

  return {
    // Data
    services: paginatedServices ?? [],
    total,
    pages,
    currentPage: options?.page || 1,

    // Loading states
    isLoading: allServices === undefined,
    isError: false,
    error: null,

    // Mutations
    createService,
    updateService,
    deleteService,

    // Mutation states
    isCreating: false,
    isUpdating: false,
    isDeleting: false,

    // Utils
    refetch: () => {}, // Convex auto-refetches
    invalidate: () => {}, // Convex auto-invalidates
  };
}

/**
 * Hook pour récupérer les services actifs (pour les formulaires)
 */
export function useActiveServices(organizationId?: Id<'organizations'> | string) {
  const services = useQuery(api.functions.service.getAllServices, {});

  const activeServices = useMemo(() => {
    if (!services) return undefined;

    let result = services.filter((s) => s.status === 'active');

    if (organizationId) {
      result = result.filter(
        (s) =>
          s.organizationId === organizationId ||
          String(s.organizationId) === String(organizationId),
      );
    }

    return result;
  }, [services, organizationId]);

  return {
    services: activeServices ?? [],
    isLoading: activeServices === undefined,
    isError: false,
    error: null,
    refetch: () => {},
  };
}
