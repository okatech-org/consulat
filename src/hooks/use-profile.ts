'use client';

import { api } from '@/trpc/react';
import { toast } from '@/hooks/use-toast';

export function useCurrentProfileOrganizationContactData() {
  return api.profile.getCurrentOrganizationContactData.useQuery(undefined);
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
        description:
          error.message || 'Une erreur est survenue lors de la soumission du profil',
        variant: 'destructive',
      });
    },
  });
}
