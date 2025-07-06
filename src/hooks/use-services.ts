import { api } from '@/trpc/react';

/**
 * Hook pour gérer les services consulaires avec tRPC
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
 * Hook pour gérer les demandes de service de l'utilisateur
 */
export function useUserServiceRequests() {
  const { 
    data: requests, 
    isLoading, 
    error,
    refetch 
  } = api.services.getUserRequests.useQuery();
  
  return {
    requests: requests ?? [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook pour soumettre une demande de service
 */
export function useSubmitServiceRequest() {
  const utils = api.useUtils();
  
  const mutation = api.services.submitRequest.useMutation({
    onSuccess: () => {
      // Invalider le cache des demandes pour forcer un rechargement
      utils.services.getUserRequests.invalidate();
    },
  });
  
  return mutation;
}
