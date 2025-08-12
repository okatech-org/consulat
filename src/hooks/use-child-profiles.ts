'use client';

import { api } from '@/trpc/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';

/**
 * Hook optimisé pour la liste des enfants (dashboard)
 * Utilise des requêtes optimisées sans over-fetching
 */
export function useChildrenDashboard(options?: { parentId?: string }) {
  const query = api.profile.getChildrenForDashboard.useQuery(options);

  return {
    children: query.data?.parentalAuthorities || [],
    totalChildren: query.data?.total || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook principal pour la gestion des profils enfants d'un parent
 * Utilise FullParentalAuthority pour les détails complets
 */
export function useChildProfiles(options?: {
  parentId?: string;
  includeInactive?: boolean;
}) {
  const utils = api.useUtils();

  const query = api.profile.getByParent.useQuery(options);

  const createMutation = api.profile.createChildProfile.useMutation({
    onMutate: async () => {
      // Annuler les requêtes en cours
      await utils.profile.getByParent.cancel();
      await utils.profile.getChildrenForDashboard.cancel();

      // Sauvegarder l'état précédent pour rollback
      const previousData = utils.profile.getByParent.getData(options);

      return { previousData };
    },
    onError: (error, newChildData, context) => {
      // Rollback en cas d'erreur
      if (context?.previousData) {
        utils.profile.getByParent.setData(options, context.previousData);
      }

      console.error('Erreur création profil enfant:', error);
      toast.error(error.message || 'Erreur lors de la création du profil enfant');
    },
    onSuccess: (data) => {
      // Invalidation et notification de succès
      utils.profile.getByParent.invalidate();
      utils.profile.getChildrenForDashboard.invalidate();
      toast.success(data.message || 'Profil enfant créé avec succès');
    },
  });

  const deleteMutation = api.profile.deleteChildProfile.useMutation({
    onMutate: async ({ id }) => {
      await utils.profile.getByParent.cancel();
      await utils.profile.getChildrenForDashboard.cancel();

      const previousData = utils.profile.getByParent.getData(options);

      // Mise à jour optimiste - retirer le profil
      if (previousData) {
        utils.profile.getByParent.setData(options, {
          ...previousData,
          parentalAuthorities: previousData.parentalAuthorities.filter(
            (auth) => auth.profile.id !== id,
          ),
          total: previousData.total - 1,
        });
      }

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        utils.profile.getByParent.setData(options, context.previousData);
      }

      console.error('Erreur suppression profil enfant:', error);
      toast.error(error.message);
    },
    onSuccess: (data) => {
      utils.profile.getByParent.invalidate();
      utils.profile.getChildrenForDashboard.invalidate();
      toast.success(data.message || 'Profil enfant supprimé avec succès');
    },
  });

  return {
    // Données
    children: query.data?.parentalAuthorities ?? [],
    totalChildren: query.data?.total ?? 0,

    // États
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    // Actions
    createChild: createMutation.mutate,
    deleteChild: deleteMutation.mutate,

    // États des mutations
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Utilitaires
    refetch: query.refetch,
    invalidate: () => utils.profile.getByParent.invalidate(),
  };
}

/**
 * Hook pour un profil enfant spécifique
 */
export function useChildProfile(id: string) {
  const utils = api.useUtils();

  const query = api.profile.getById.useQuery(
    { id },
    {
      enabled: !!id,
    },
  );

  const updateBasicInfoMutation = api.profile.updateBasicInfo.useMutation({
    onMutate: async ({ id }) => {
      await utils.profile.getById.cancel({ id });

      const previousData = utils.profile.getById.getData({ id });

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        utils.profile.getById.setData({ id: variables.id }, context.previousData);
      }

      console.error('Erreur mise à jour profil enfant:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    },
    onSuccess: (data) => {
      utils.profile.getById.invalidate({ id });
      utils.profile.getByParent.invalidate();
      toast.success(data.message || 'Profil mis à jour avec succès');
    },
  });

  const submitMutation = api.profile.submitChildProfileForValidation.useMutation({
    onMutate: async ({ id }) => {
      await utils.profile.getById.cancel({ id });

      const previousData = utils.profile.getById.getData({ id });

      // Mise à jour optimiste du statut
      if (previousData) {
        utils.profile.getById.setData(
          { id },
          {
            ...previousData,
            status: 'SUBMITTED',
            submittedAt: new Date(),
          },
        );
      }

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        utils.profile.getById.setData({ id: variables.id }, context.previousData);
      }

      console.error('Erreur soumission profil enfant:', error);
      toast.error('Erreur lors de la soumission du profil');
    },
    onSuccess: (data) => {
      utils.profile.getById.invalidate({ id });
      utils.profile.getByParent.invalidate();
      toast.success(data.message || 'Profil soumis pour validation avec succès');
    },
  });

  return {
    // Données
    profile: query.data,

    // États
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    // Actions
    updateBasicInfo: updateBasicInfoMutation.mutate,
    submitForValidation: submitMutation.mutate,

    // États des mutations
    isUpdating: updateBasicInfoMutation.isPending,
    isSubmitting: submitMutation.isPending,

    // Utilitaires
    refetch: query.refetch,
    invalidate: () => utils.profile.getById.invalidate({ id }),
  };
}

/**
 * Hook pour les statistiques des profils enfants
 */
export function useChildProfilesStats(parentId?: string) {
  const query = api.profile.getChildProfileStats.useQuery(
    parentId ? { parentId } : undefined,
  );

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook pour la gestion de l'autorité parentale
 */
export function useParentalAuthority() {
  const utils = api.useUtils();

  const updateMutation = api.profile.updateParentalAuthority.useMutation({
    onMutate: async ({ profileId, parentUserId, role, isActive }) => {
      // Annuler les requêtes en cours
      await utils.profile.getByParent.cancel();
      await utils.profile.getById.cancel({ id: profileId });

      // Sauvegarder les données précédentes
      const previousListData = utils.profile.getByParent.getData();
      const previousProfileData = utils.profile.getById.getData({ id: profileId });

      // Mise à jour optimiste dans la liste
      if (previousListData) {
        const updatedAuthorities = previousListData.parentalAuthorities.map((auth) => {
          if (auth.profile.id === profileId && auth.parentUserId === parentUserId) {
            return {
              ...auth,
              ...(role && { role }),
              ...(isActive !== undefined && { isActive }),
            };
          }
          return auth;
        });

        utils.profile.getByParent.setData(undefined, {
          ...previousListData,
          parentalAuthorities: updatedAuthorities,
        });
      }

      return { previousListData, previousProfileData };
    },
    onError: (error, variables, context) => {
      // Rollback
      if (context?.previousListData) {
        utils.profile.getByParent.setData(undefined, context.previousListData);
      }
      if (context?.previousProfileData) {
        utils.profile.getById.setData(
          { id: variables.profileId },
          context.previousProfileData,
        );
      }

      console.error('Erreur mise à jour autorité parentale:', error);
      toast.error("Erreur lors de la mise à jour de l'autorité parentale");
    },
    onSuccess: (data) => {
      utils.profile.getByParent.invalidate();
      utils.profile.getById.invalidate();
      toast.success(data.message || 'Autorité parentale mise à jour');
    },
  });

  return {
    updateAuthority: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

/**
 * Hook pour la création de profil enfant avec navigation
 */
export function useChildProfileCreation() {
  const router = useRouter();
  const utils = api.useUtils();

  const createMutation = api.profile.createChildProfile.useMutation({
    onSuccess: (data) => {
      utils.profile.getByParent.invalidate();
      toast.success(data.message || 'Profil enfant créé avec succès');

      // Navigation vers la page du profil créé
      router.push(ROUTES.user.child_profile(data.id));
    },
    onError: (error) => {
      console.error('Erreur création profil enfant:', error);
      toast.error('Erreur lors de la création du profil enfant');
    },
  });

  return {
    createChild: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}

/**
 * Hook pour la mise à jour de profil enfant avec navigation
 */
export function useChildProfileUpdate(profileId: string) {
  const router = useRouter();
  const utils = api.useUtils();

  const updateMutation = api.profile.updateBasicInfo.useMutation({
    onSuccess: (data) => {
      utils.profile.getById.invalidate({ id: profileId });
      utils.profile.getByParent.invalidate();
      toast.success(data.message || 'Profil mis à jour avec succès');

      // Optionnel: navigation vers la liste des enfants
      // router.push(ROUTES.user.children);
    },
    onError: (error) => {
      console.error('Erreur mise à jour profil enfant:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    },
  });

  const submitMutation = api.profile.submitChildProfileForValidation.useMutation({
    onSuccess: (data) => {
      utils.profile.getById.invalidate({ id: profileId });
      utils.profile.getByParent.invalidate();
      toast.success(data.message || 'Profil soumis pour validation avec succès');

      // Navigation vers la liste des enfants après soumission
      router.push(ROUTES.user.children);
    },
    onError: (error) => {
      console.error('Erreur soumission profil enfant:', error);
      toast.error('Erreur lors de la soumission du profil');
    },
  });

  return {
    updateProfile: updateMutation.mutate,
    submitProfile: submitMutation.mutate,
    isUpdating: updateMutation.isPending,
    isSubmitting: submitMutation.isPending,
  };
}
