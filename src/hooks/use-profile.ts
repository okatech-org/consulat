'use client';

import { api } from '@/trpc/react';
import { toast } from '@/hooks/use-toast';

/**
 * Hook pour récupérer le profil de l'utilisateur actuel
 */
export function useCurrentProfile() {
  return api.profile.getCurrent.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/**
 * Hook pour récupérer un profil par ID
 */
export function useProfile(profileId: string) {
  return api.profile.getById.useQuery(
    { id: profileId },
    {
      enabled: !!profileId,
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    }
  );
}

/**
 * Hook pour récupérer la demande d'enregistrement d'un profil
 */
export function useProfileRegistrationRequest(profileId: string) {
  return api.profile.getRegistrationRequest.useQuery(
    { profileId },
    {
      enabled: !!profileId,
      staleTime: 2 * 60 * 1000, // 2 minutes - les demandes changent plus fréquemment
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Hook pour récupérer le service d'enregistrement
 */
export function useRegistrationService() {
  return api.profile.getRegistrationService.useQuery(undefined, {
    staleTime: 30 * 60 * 1000, // 30 minutes - les services changent rarement
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook pour créer un profil
 */
export function useCreateProfile() {
  const utils = api.useUtils();

  return api.profile.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Profil créé',
        description: 'Votre profil a été créé avec succès',
        variant: 'success',
      });

      // Invalider le cache du profil actuel
      utils.profile.getCurrent.invalidate();
    },
    onError: (error) => {
      console.error('Error creating profile:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la création du profil',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook pour mettre à jour un profil
 */
export function useUpdateProfile() {
  const utils = api.useUtils();

  return api.profile.update.useMutation({
    onMutate: async ({ profileId }) => {
      // Optimistic update - annuler les requêtes en cours
      await utils.profile.getCurrent.cancel();
      await utils.profile.getById.cancel({ id: profileId });
      
      // Sauvegarder l'état précédent
      const previousCurrentProfile = utils.profile.getCurrent.getData();
      const previousProfile = utils.profile.getById.getData({ id: profileId });
      
      return { previousCurrentProfile, previousProfile, profileId };
    },
    onError: (error, variables, context) => {
      // Rollback en cas d'erreur
      if (context?.previousCurrentProfile) {
        utils.profile.getCurrent.setData(undefined, context.previousCurrentProfile);
      }
      if (context?.previousProfile && context?.profileId) {
        utils.profile.getById.setData({ id: context.profileId }, context.previousProfile);
      }
      
      console.error('Error updating profile:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la mise à jour du profil',
        variant: 'destructive',
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Profil mis à jour',
        description: 'Votre profil a été mis à jour avec succès',
        variant: 'success',
      });

      // Invalider les caches
      utils.profile.getCurrent.invalidate();
      utils.profile.getById.invalidate({ id: variables.profileId });
    },
  });
}

/**
 * Hook pour mettre à jour une section du profil
 */
export function useUpdateProfileSection() {
  const utils = api.useUtils();

  return api.profile.updateSection.useMutation({
    onSuccess: (data, variables) => {
      toast({
        title: 'Section mise à jour',
        description: 'La section du profil a été mise à jour avec succès',
        variant: 'success',
      });

      // Invalider les caches
      utils.profile.getCurrent.invalidate();
      utils.profile.getById.invalidate({ id: variables.profileId });
    },
    onError: (error) => {
      console.error('Error updating profile section:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la mise à jour de la section',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook pour soumettre un profil pour validation
 */
export function useSubmitProfile() {
  const utils = api.useUtils();

  return api.profile.submit.useMutation({
    onSuccess: (data, variables) => {
      toast({
        title: 'Profil soumis',
        description: 'Votre profil a été soumis pour validation avec succès',
        variant: 'success',
      });

      // Invalider les caches
      utils.profile.getCurrent.invalidate();
      utils.profile.getById.invalidate({ id: variables.profileId });
      utils.profile.getRegistrationRequest.invalidate({ profileId: variables.profileId });
    },
    onError: (error) => {
      console.error('Error submitting profile:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la soumission du profil',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook combiné pour toutes les actions profile
 */
export function useProfileActions() {
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const updateProfileSection = useUpdateProfileSection();
  const submitProfile = useSubmitProfile();

  return {
    // Actions
    createProfile: createProfile.mutate,
    updateProfile: updateProfile.mutate,
    updateProfileSection: updateProfileSection.mutate,
    submitProfile: submitProfile.mutate,
    
    // États de chargement
    isCreatingProfile: createProfile.isPending,
    isUpdatingProfile: updateProfile.isPending,
    isUpdatingProfileSection: updateProfileSection.isPending,
    isSubmittingProfile: submitProfile.isPending,
  };
} 