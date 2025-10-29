'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import type { Id } from '@/convex/_generated/dataModel';
import type { ProfilesFilters } from '@/app/(authenticated)/dashboard/profiles/page';
import type { ChildProfilesFilters } from '@/app/(authenticated)/dashboard/child-profiles/page';

/**
 * Hook for fetching profiles list with filtering and pagination
 */
export function useProfilesList(filters: ProfilesFilters = {}) {
  const profilesData = useQuery(api.functions.profile.getProfilesListEnriched, {
    search: filters.search,
    status: filters.status,
    gender: filters.gender,
    countryCode: filters.countryCode,
    page: filters.page || 1,
    limit: filters.limit || 10,
  });

  return {
    profiles: profilesData?.items ?? [],
    total: profilesData?.total ?? 0,
    page: profilesData?.page ?? 1,
    limit: profilesData?.limit ?? 10,
    isLoading: profilesData === undefined,
    error: null,
  };
}

/**
 * Hook for fetching profiles list with filtering and pagination
 */
export function useChildProfilesList(filters: ChildProfilesFilters = {}) {
  const profilesData = useQuery(api.functions.childProfile.getChildProfilesListEnriched, {
    search: filters.search,
    status: filters.status,
    gender: filters.gender,
    countryCode: filters.countryCode,
    page: filters.page || 1,
    limit: filters.limit || 10,
  });

  return {
    profiles: profilesData?.items ?? [],
    total: profilesData?.total ?? 0,
    page: profilesData?.page ?? 1,
    limit: profilesData?.limit ?? 10,
    isLoading: profilesData === undefined,
    error: null,
  };
}

/**
 * Hook to update a profile
 */
export function useUpdateProfile() {
  const updateMutation = useMutation(api.functions.profile.updateProfile);

  const updateProfile = async (profileId: Id<'profiles'>, data: any) => {
    try {
      await updateMutation({
        profileId,
        ...data,
      });
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
      throw error;
    }
  };

  return {
    updateProfile,
    isUpdating: false,
  };
}

/**
 * Hook to update profile status
 */
export function useUpdateProfileStatus() {
  const updateStatusMutation = useMutation(api.functions.profile.updateProfileStatus);

  const updateStatus = async (profileId: Id<'profiles'>, status: string) => {
    try {
      await updateStatusMutation({
        profileId,
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
 * Hook to get current user profile
 */
export function useCurrentProfile(profileId?: Id<'profiles'>) {
  const profile = useQuery(api.functions.profile.getCurrentProfile, {
    profileId,
  });

  return {
    profile,
    isLoading: profile === undefined,
    error: null,
  };
}
