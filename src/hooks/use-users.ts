'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import type { Id } from '@/convex/_generated/dataModel';
import { CountryCode, UserRole, UserStatus } from '@/convex/lib/constants';

// Types pour les filtres d'utilisateurs
export interface UsersFilters {
  search?: string;
  roles?: UserRole[];
  status?: UserStatus;
  countryCode?: CountryCode[];
  organizationId?: Id<'organizations'>[];
  hasProfile?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Hook principal pour la gestion des utilisateurs avec filtres et pagination
 */
export function useUsers(filters: UsersFilters = {}) {
  // Convert filter format for Convex query
  const roles = filters.roles as UserRole[] | undefined;
  const status = filters.status as UserStatus | undefined;
  const organizationIds = filters.organizationId
    ? (filters.organizationId as Id<'organizations'>[])
    : undefined;

  // Query pour récupérer la liste des utilisateurs enrichie
  const usersData = useQuery(api.functions.user.getUsersListEnriched, {
    search: filters.search,
    roles,
    status,
    countryCode: filters.countryCode,
    organizationId: organizationIds,
    hasProfile: filters.hasProfile,
    page: filters.page || 1,
    limit: filters.limit || 10,
  });

  // Mutation pour créer un utilisateur
  const createMutation = useMutation(api.functions.user.createUser);

  const createUser = async (data: {
    userId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    roles?: string[];
  }) => {
    try {
      await createMutation({
        userId: data.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        roles: (data.roles as UserRole[]) || [UserRole.User],
      });

      toast.success('Utilisateur créé avec succès');
    } catch (error) {
      toast.error("Erreur lors de la création de l'utilisateur");
      throw error;
    }
  };

  // Mutation pour mettre à jour un utilisateur
  const updateMutation = useMutation(api.functions.user.updateUser);

  const updateUser = async (
    userId: Id<'users'>,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phoneNumber?: string;
      roles?: string[];
      status?: string;
    },
  ) => {
    try {
      await updateMutation({
        userId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        roles: data.roles as UserRole[] | undefined,
        status: data.status as UserStatus | undefined,
      });

      toast.success('Utilisateur mis à jour avec succès');
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de l'utilisateur");
      throw error;
    }
  };

  // Mutation pour supprimer un utilisateur
  const deleteMutation = useMutation(api.functions.user.deleteUser);

  const deleteUser = async (userId: Id<'users'>) => {
    try {
      await deleteMutation({ userId });
      toast.success('Utilisateur supprimé avec succès');
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'utilisateur");
      throw error;
    }
  };

  return {
    // Data
    users: usersData?.users ?? [],
    total: usersData?.total ?? 0,
    page: usersData?.page ?? 1,
    limit: usersData?.limit ?? 10,
    totalPages: usersData ? Math.ceil(usersData.total / usersData.limit) : 0,

    // Loading states
    isLoading: usersData === undefined,
    error: null,

    // Mutations
    createUser,
    updateUser,
    deleteUser,

    // Mutation states
    isCreating: false,
    isUpdating: false,
    isDeleting: false,

    // Utils
    refetch: () => {}, // Convex auto-refetches
  };
}

/**
 * Hook pour récupérer un utilisateur spécifique
 */
export function useUser(userId: Id<'users'>) {
  const userData = useQuery(api.functions.user.getUser, { userId });

  const updateMutation = useMutation(api.functions.user.updateUser);

  const updateUser = async (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    roles?: string[];
    status?: string;
  }) => {
    try {
      await updateMutation({
        userId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        roles: data.roles as UserRole[] | undefined,
        status: data.status as UserStatus | undefined,
      });

      toast.success('Utilisateur mis à jour avec succès');
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de l'utilisateur");
      throw error;
    }
  };

  return {
    user: userData,
    isLoading: userData === undefined,
    error: null,
    updateUser,
    isUpdating: false,
  };
}

/**
 * Hook pour récupérer le profil d'un utilisateur
 */
export function useUserProfile(userId: Id<'users'>) {
  const profileData = useQuery(api.functions.user.getUserProfile, { userId });

  return {
    profile: profileData,
    isLoading: profileData === undefined,
    error: null,
  };
}
