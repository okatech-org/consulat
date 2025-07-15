import { api } from '@/trpc/react';
import { ServiceCategory, RequestStatus } from '@prisma/client';

/**
 * Hook optimisé pour gérer les services consulaires avec pagination et filtres
 */
export function useServicesDashboard(options?: {
  limit?: number;
  category?: ServiceCategory;
  isActive?: boolean;
  search?: string;
  organizationId?: string;
  enabled?: boolean;
}) {
  const limit = options?.limit ?? 20;
  const enabled = options?.enabled ?? true;

  return api.services.getAvailableServicesDashboard.useInfiniteQuery(
    {
      limit,
      category: options?.category,
      isActive: options?.isActive,
      search: options?.search,
      organizationId: options?.organizationId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  );
}

/**
 * Hook optimisé pour gérer les demandes de service utilisateur avec pagination
 */
export function useUserServiceRequestsDashboard(options?: {
  limit?: number;
  status?: RequestStatus[];
  search?: string;
  enabled?: boolean;
}) {
  const limit = options?.limit ?? 20;
  const enabled = options?.enabled ?? true;

  return api.services.getUserServiceRequestsDashboard.useInfiniteQuery(
    {
      limit,
      status: options?.status,
      search: options?.search,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled,
      staleTime: 3 * 60 * 1000, // 3 minutes (plus fréquent pour les demandes)
      refetchOnWindowFocus: false,
    },
  );
}

/**
 * Hook pour gérer les services consulaires (ancienne version)
 */
export function useServices() {
  const { data: services, isLoading, error } = api.services.getAvailable.useQuery();

  return {
    services: services ?? [],
    isLoading,
    error,
  };
}

/**
 * Hook pour les demandes de service utilisateur (ancienne version)
 */
export function useUserServiceRequests() {
  const { data: requests, isLoading, error } = api.services.getUserRequests.useQuery();

  return {
    requests: requests ?? [],
    isLoading,
    error,
  };
}

/**
 * Hook pour les actions sur les services
 */
export function useServicesActions() {
  const utils = api.useUtils();

  const submitRequest = api.services.submitRequest.useMutation({
    onSuccess: () => {
      // Invalider les caches liés aux demandes
      utils.services.getUserServiceRequestsDashboard.invalidate();
      utils.services.getUserRequests.invalidate();
      utils.user.getActiveRequestsCount.invalidate();
    },
  });

  return {
    submitRequest,
  };
}
