'use client';

import { api } from '@/trpc/react';
import { toast } from '@/hooks/use-toast';

/**
 * Hook pour récupérer la liste des profils publics
 */
export function usePublicProfiles() {
  return api.profile.getList.useQuery({
    page: 1,
    limit: 10,
    status: ['VALIDATED'],
    sort: {
      field: 'createdAt',
      order: 'desc',
    },
  });
}

/**
 * Hook pour récupérer un profil public par ID
 */
export function usePublicProfile(profileId: string) {
  return api.profile.getById.useQuery({ id: profileId }, { enabled: !!profileId });
}

/**
 * Hook pour envoyer un message à un propriétaire de profil
 */
export function useSendMessage() {
  return api.profile.sendMessage.useMutation({
    onSuccess: () => {
      toast({
        title: 'Message envoyé',
        description: `Votre message a été envoyé avec succès`,
        variant: 'success',
      });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast({
        title: 'Erreur',
        description:
          error.message || "Une erreur est survenue lors de l'envoi du message",
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook combiné pour la gestion des profils publics
 */
export function usePublicProfilesActions() {
  const sendMessage = useSendMessage();

  return {
    sendMessage: sendMessage.mutate,
    isSendingMessage: sendMessage.isPending,
  };
}
