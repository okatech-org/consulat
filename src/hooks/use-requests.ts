'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import type { Id } from '@/convex/_generated/dataModel';
import type {
  RequestStatus,
  ServiceCategory,
  RequestPriority,
} from '@/convex/lib/constants';

// Types pour les filtres
export interface RequestFilters {
  search?: string;
  status?: RequestStatus[];
  priority?: RequestPriority[];
  serviceCategory?: ServiceCategory[];
  assignedToId?: Id<'memberships'>[];
  organizationId?: Id<'organizations'>[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Hook principal pour la gestion des demandes
 */
export function useRequests(filters?: RequestFilters) {
  const requestsData = useQuery(api.functions.request.getRequestsListEnriched, {
    search: filters?.search,
    status: filters?.status || undefined,
    priority: filters?.priority || undefined,
    serviceCategory: filters?.serviceCategory,
    assignedToId: filters?.assignedToId || undefined,
    organizationId: filters?.organizationId || undefined,
    page: filters?.page || 1,
    limit: filters?.limit || 10,
    sortBy: filters?.sortBy || 'createdAt',
    sortOrder: filters?.sortOrder || 'desc',
  });

  return {
    requests: requestsData?.items ?? [],
    total: requestsData?.total ?? 0,
    page: requestsData?.page ?? 1,
    limit: requestsData?.limit ?? 10,
    isLoading: requestsData === undefined,
    error: null,
  };
}

/**
 * Hook pour une demande spécifique
 */
export function useRequest(requestId: Id<'requests'>) {
  const request = useQuery(api.functions.request.getRequest, {
    requestId,
  });

  return {
    request,
    isLoading: request === undefined,
    error: null,
  };
}

/**
 * Hook pour mettre à jour le statut d'une demande
 */
export function useUpdateRequestStatus() {
  const updateStatusMutation = useMutation(api.functions.request.updateRequestStatus);

  const updateStatus = async (requestId: Id<'requests'>, status: RequestStatus) => {
    try {
      await updateStatusMutation({
        requestId,
        status,
      });
      toast.success('Statut mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
      throw error;
    }
  };

  return {
    updateStatus,
    isUpdating: false,
  };
}

/**
 * Hook pour assigner une demande
 */
export function useAssignRequest() {
  const assignMutation = useMutation(api.functions.request.assignRequestToAgent);

  const assignRequest = async (requestId: Id<'requests'>, agentId: Id<'memberships'>) => {
    try {
      await assignMutation({
        requestId,
        agentId,
      });
      toast.success('Demande assignée avec succès');
    } catch (error) {
      toast.error("Erreur lors de l'assignation");
      throw error;
    }
  };

  return {
    assignRequest,
    isAssigning: false,
  };
}
