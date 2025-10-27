'use client';

import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import type { Id } from '@/convex/_generated/dataModel';
import { CountryCode, UserRole } from '@/convex/lib/constants';

// Types for the hooks
export interface AgentFilters {
  search?: string;
  linkedCountries?: CountryCode[];
  assignedServices?: Id<'services'>[];
  assignedOrganizationId?: Id<'organizations'>[];
  managedByUserId?: Id<'memberships'>[];
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
  countryCodes: CountryCode[];
  serviceIds: Id<'services'>[];
  assignedOrganizationId: Id<'organizations'>;
  role?: UserRole;
  managedByUserId?: Id<'memberships'>;
}

export interface UpdateAgentData {
  name?: string;
  email?: string;
  phoneNumber?: string;
  countryCodes?: CountryCode[];
  serviceIds?: Id<'services'>[];
  managedByUserId?: Id<'memberships'>;
  role?: UserRole;
}

/**
 * Hook principal pour la gestion des agents avec filtres et pagination
 */
export function useAgents(filters: AgentFilters = {}) {
  const router = useRouter();

  // Convert filter format for Convex query
  const organizationId = filters.assignedOrganizationId?.[0]
    ? (filters.assignedOrganizationId[0] as Id<'organizations'>)
    : undefined;

  const managerId = filters.managedByUserId?.[0] ? filters.managedByUserId[0] : undefined;

  // Query pour la liste des agents
  const agentsData = useQuery(api.functions.membership.getAgentsList, {
    organizationId,
    search: filters.search,
    linkedCountries: filters.linkedCountries,
    assignedServices: filters.assignedServices || [],
    managerId,
    page: filters.page || 1,
    limit: filters.limit || 10,
  });

  // Mutation pour créer un agent
  const createUserMutation = useMutation(api.functions.user.createUser);

  const createAgent = async (data: CreateAgentData) => {
    try {
      // Note: Additional operations like adding membership, linking countries/services
      // would need to be handled via separate mutations or a compound action
      const result = await createUserMutation({
        userId: `user_${Date.now()}`, // Temporary ID, should be generated on backend
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        roles: [data.role as UserRole],
      });

      toast.success('Agent créé avec succès');
      router.push(ROUTES.dashboard.agents);
      return result;
    } catch (error) {
      toast.error("Erreur lors de la création de l'agent");
      throw error;
    }
  };

  // Mutation pour mettre à jour un agent
  const updateUserMutation = useMutation(api.functions.user.updateUser);

  const updateAgent = async (agentId: Id<'users'>, data: UpdateAgentData) => {
    try {
      await updateUserMutation({
        userId: agentId,
        firstName: data.name?.split(' ')[0],
        lastName: data.name?.split(' ').slice(1).join(' '),
        email: data.email,
        phoneNumber: data.phoneNumber,
      });

      toast.success('Agent mis à jour avec succès');
      return true;
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de l'agent");
      throw error;
    }
  };

  return {
    // Données
    agents: agentsData?.agents || [],
    total: agentsData?.total || 0,
    page: agentsData?.page || 1,
    limit: agentsData?.limit || 10,
    totalPages: Math.ceil((agentsData?.total || 0) / (agentsData?.limit || 10)),

    // États
    isLoading: agentsData === undefined,
    error: null,

    // Actions
    createAgent,
    updateAgent,

    // États des mutations
    isCreating: false,
    isUpdating: false,
  };
}

/**
 * Hook pour récupérer un agent (user) avec ses détails de base
 * @deprecated Use useAgentDetails instead for full agent details including membership info
 */
export function useAgent(id: Id<'users'>) {
  const agentData = useQuery(api.functions.user.getUser, { userId: id });

  const updateUserMutation = useMutation(api.functions.user.updateUser);

  const updateAgent = async (data: UpdateAgentData) => {
    try {
      await updateUserMutation({
        userId: id,
        firstName: data.name?.split(' ')[0],
        lastName: data.name?.split(' ').slice(1).join(' '),
        email: data.email,
        phoneNumber: data.phoneNumber,
      });

      toast.success('Agent mis à jour avec succès');
      return true;
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de l'agent");
      throw error;
    }
  };

  return {
    agent: agentData,
    isLoading: agentData === undefined,
    error: null,
    updateAgent,
    isUpdating: false,
  };
}
/**
 * Hook pour récupérer les managers d'une organisation
 */
export function useManagers(organizationId?: Id<'organizations'>) {
  const managersData = useQuery(api.functions.membership.getManagersForFilter, {
    organizationId,
  });

  return {
    managers: managersData || [],
    isLoading: managersData === undefined,
    error: null,
  };
}

/**
 * Hook pour récupérer les agents d'une organisation
 */
export function useOrganizationAgents(organizationId?: Id<'organizations'>) {
  const agentsData = useQuery(
    api.functions.membership.getOrganizationAgents,
    organizationId ? { organizationId } : 'skip',
  );

  return {
    agents:
      agentsData?.map((agent) => ({
        id: agent._id,
        name: `${agent.firstName || ''} ${agent.lastName || ''}`.trim(),
      })) || [],
    isLoading: agentsData === undefined,
    error: null,
  };
}
