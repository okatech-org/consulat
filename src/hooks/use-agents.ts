'use client';

import { api } from '@/trpc/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import type { UserRole } from '@prisma/client';

// Types pour les hooks
export interface AgentFilters {
  search?: string;
  linkedCountries?: string[];
  assignedServices?: string[];
  assignedOrganizationId?: string[];
  managedByUserId?: string[];
  page?: number;
  limit?: number;
  sortBy?: {
    field: 'name' | 'email' | 'createdAt' | 'completedRequests';
    direction: 'asc' | 'desc';
  };
}

export interface CreateAgentData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  countryIds: string[];
  serviceIds: string[];
  assignedOrganizationId: string;
  role?: UserRole;
  managedByUserId?: string;
  managedAgentIds?: string[];
}

export interface UpdateAgentData {
  name?: string;
  email?: string;
  phoneNumber?: string;
  countryIds?: string[];
  serviceIds?: string[];
  managedByUserId?: string | null;
  role?: UserRole;
  managedAgentIds?: string[];
}

/**
 * Hook principal pour la gestion des agents avec filtres et pagination
 */
export function useAgents(filters: AgentFilters = {}) {
  const utils = api.useUtils();
  const router = useRouter();

  // Query pour la liste des agents
  const {
    data: agentsData,
    isLoading,
    error,
    refetch,
  } = api.agents.getList.useQuery(
    {
      search: filters.search,
      linkedCountries: filters.linkedCountries,
      assignedServices: filters.assignedServices,
      assignedOrganizationId: filters.assignedOrganizationId,
      managedByUserId: filters.managedByUserId,
      page: filters.page || 1,
      limit: filters.limit || 10,
      sortBy: filters.sortBy,
    },
    {
      staleTime: 30 * 1000, // 30 secondes
      refetchOnWindowFocus: false,
    }
  );

  // Mutation pour créer un agent
  const createAgentMutation = api.agents.create.useMutation({
    onSuccess: (newAgent) => {
      toast.success(`Agent ${newAgent.name} créé avec succès`);
      
      // Invalider la liste des agents
      utils.agents.getList.invalidate();
      
      // Optionnel : rediriger vers la page de détail
      router.push(ROUTES.dashboard.agent_detail(newAgent.id));
    },
    onError: (error) => {
      console.error('Erreur lors de la création de l\'agent:', error);
      toast.error('Erreur lors de la création de l\'agent');
    },
  });

  // Mutation pour mettre à jour un agent
  const updateAgentMutation = api.agents.update.useMutation({
    onMutate: async ({ id, data }) => {
      // Annuler les requêtes en cours
      await utils.agents.getList.cancel();
      await utils.agents.getById.cancel({ id });

      // Sauvegarder les données précédentes
      const previousAgentsList = utils.agents.getList.getData();
      const previousAgent = utils.agents.getById.getData({ id });

             // Optimistic update pour la liste
       if (previousAgentsList) {
         utils.agents.getList.setData(
           filters, // Utiliser les filtres actuels
           (old) => {
             if (!old) return old;
             return {
               ...old,
               items: old.items.map((agent) =>
                 agent.id === id ? { ...agent, ...data } : agent
               ),
             };
           }
         );
       }

      // Optimistic update pour l'agent individuel
      if (previousAgent) {
        utils.agents.getById.setData(
          { id },
          (old) => {
            if (!old) return old;
            return { ...old, ...data };
          }
        );
      }

      return { previousAgentsList, previousAgent };
    },
    onError: (error, { id }, context) => {
      console.error('Erreur lors de la mise à jour de l\'agent:', error);
      toast.error('Erreur lors de la mise à jour de l\'agent');

             // Restaurer les données précédentes
       if (context?.previousAgentsList) {
         utils.agents.getList.setData(filters, context.previousAgentsList);
       }
      if (context?.previousAgent) {
        utils.agents.getById.setData({ id }, context.previousAgent);
      }
    },
    onSuccess: (updatedAgent) => {
      toast.success(`Agent ${updatedAgent.name} mis à jour avec succès`);
    },
    onSettled: () => {
      // Rafraîchir les données
      utils.agents.getList.invalidate();
      utils.agents.getById.invalidate();
    },
  });

  // Mutation pour assigner une demande
  const assignRequestMutation = api.agents.assignRequest.useMutation({
    onSuccess: (updatedRequest) => {
      toast.success('Demande assignée avec succès');
      
      // Invalider les données liées
      utils.agents.getList.invalidate();
      utils.agents.getById.invalidate();
      utils.requests.getList.invalidate();
      utils.requests.getById.invalidate({ id: updatedRequest.id });
    },
    onError: (error) => {
      console.error('Erreur lors de l\'assignation:', error);
      toast.error('Erreur lors de l\'assignation de la demande');
    },
  });

  // Mutation pour réassigner une demande
  const reassignRequestMutation = api.agents.reassignRequest.useMutation({
    onSuccess: () => {
      toast.success('Demande réassignée avec succès');
      
      // Invalider les données liées
      utils.agents.getList.invalidate();
      utils.agents.getById.invalidate();
      utils.requests.getList.invalidate();
    },
    onError: (error) => {
      console.error('Erreur lors de la réassignation:', error);
      toast.error('Erreur lors de la réassignation de la demande');
    },
  });

  return {
    // Données
    agents: agentsData?.items || [],
    total: agentsData?.total || 0,
    page: agentsData?.page || 1,
    limit: agentsData?.limit || 10,
    totalPages: agentsData?.totalPages || 0,
    
    // États
    isLoading,
    error,
    
    // Actions
    refetch,
    createAgent: createAgentMutation.mutate,
    updateAgent: updateAgentMutation.mutate,
    assignRequest: assignRequestMutation.mutate,
    reassignRequest: reassignRequestMutation.mutate,
    
    // États des mutations
    isCreating: createAgentMutation.isPending,
    isUpdating: updateAgentMutation.isPending,
    isAssigning: assignRequestMutation.isPending,
    isReassigning: reassignRequestMutation.isPending,
  };
}

/**
 * Hook pour récupérer un agent spécifique avec ses détails complets
 */
export function useAgent(id: string) {
  const utils = api.useUtils();

  const {
    data: agent,
    isLoading,
    error,
    refetch,
  } = api.agents.getById.useQuery(
    { id },
    {
      enabled: !!id,
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    }
  );

  // Mutation pour mettre à jour l'agent
  const updateAgentMutation = api.agents.update.useMutation({
    onMutate: async ({ data }) => {
      await utils.agents.getById.cancel({ id });
      const previousAgent = utils.agents.getById.getData({ id });

      utils.agents.getById.setData(
        { id },
        (old) => {
          if (!old) return old;
          return { ...old, ...data };
        }
      );

      return { previousAgent };
    },
    onError: (error, _, context) => {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour de l\'agent');

      if (context?.previousAgent) {
        utils.agents.getById.setData({ id }, context.previousAgent);
      }
    },
    onSuccess: (updatedAgent) => {
      toast.success(`Agent ${updatedAgent.name} mis à jour avec succès`);
    },
    onSettled: () => {
      utils.agents.getById.invalidate({ id });
      utils.agents.getList.invalidate();
    },
  });

  return {
    agent,
    isLoading,
    error,
    refetch,
    updateAgent: updateAgentMutation.mutate,
    isUpdating: updateAgentMutation.isPending,
  };
}

/**
 * Hook pour récupérer les agents disponibles pour un service/pays
 */
export function useAvailableAgents(
  organizationId: string,
  countryCode: string,
  serviceId: string,
  enabled = true
) {
  const {
    data: availableAgents,
    isLoading,
    error,
  } = api.agents.getAvailable.useQuery(
    {
      organizationId,
      countryCode,
      serviceId,
    },
    {
      enabled: enabled && !!organizationId && !!countryCode && !!serviceId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: false,
    }
  );

  return {
    availableAgents: availableAgents || [],
    isLoading,
    error,
  };
}

/**
 * Hook pour récupérer les métriques de performance d'un agent
 */
export function useAgentPerformance(agentId: string, enabled = true) {
  const {
    data: performanceMetrics,
    isLoading,
    error,
    refetch,
  } = api.agents.getPerformanceMetrics.useQuery(
    { agentId },
    {
      enabled: enabled && !!agentId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  return {
    performanceMetrics,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook pour récupérer les statistiques globales des agents
 */
export function useAgentsStats(organizationId?: string, managerId?: string) {
  const {
    data: agentsStats,
    isLoading,
    error,
    refetch,
  } = api.agents.getStats.useQuery(
    {
      organizationId,
      managerId,
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: false,
    }
  );

  return {
    agentsStats,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook pour les actions d'assignation/réassignation
 */
export function useAgentAssignment() {
  const utils = api.useUtils();

  const assignRequestMutation = api.agents.assignRequest.useMutation({
    onSuccess: (updatedRequest) => {
      toast.success('Demande assignée avec succès');
      
      // Invalider toutes les données liées
      utils.agents.getList.invalidate();
      utils.agents.getById.invalidate();
      utils.requests.getList.invalidate();
      utils.requests.getById.invalidate({ id: updatedRequest.id });
      utils.dashboard.invalidate();
    },
    onError: (error) => {
      console.error('Erreur lors de l\'assignation:', error);
      toast.error('Erreur lors de l\'assignation de la demande');
    },
  });

  const reassignRequestMutation = api.agents.reassignRequest.useMutation({
    onSuccess: () => {
      toast.success('Demande réassignée avec succès');
      
      // Invalider toutes les données liées
      utils.agents.getList.invalidate();
      utils.agents.getById.invalidate();
      utils.requests.getList.invalidate();
      utils.dashboard.invalidate();
    },
    onError: (error) => {
      console.error('Erreur lors de la réassignation:', error);
      toast.error('Erreur lors de la réassignation de la demande');
    },
  });

  return {
    assignRequest: assignRequestMutation.mutate,
    reassignRequest: reassignRequestMutation.mutate,
    isAssigning: assignRequestMutation.isPending,
    isReassigning: reassignRequestMutation.isPending,
  };
} 