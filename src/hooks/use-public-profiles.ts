import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useToast } from '@/hooks/use-toast';
import type { Id } from '@/convex/_generated/dataModel';

interface SendMessageParams {
  userId: Id<'users'>;
  message: string;
  recipientEmail: string;
  from: string;
  contact: string;
}

export function useSendMessage() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const sendMessageMutation = useMutation(api.functions.profile.sendProfileMessage);

  return {
    mutateAsync: async (params: SendMessageParams) => {
      try {
        const result = await sendMessageMutation({
          userId: params.userId,
          message: params.message,
          recipientEmail: params.recipientEmail,
          from: params.from,
          contact: params.contact,
          senderId: user?._id,
        });

        toast({
          title: 'Message envoyé',
          description: 'Votre message a été envoyé avec succès.',
        });

        return result;
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Erreur',
          description: "Une erreur est survenue lors de l'envoi du message.",
          variant: 'destructive',
        });
        throw error;
      }
    },
    isPending: false,
  };
}
