import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import type { Id } from '@/convex/_generated/dataModel';
import { NotificationChannel, NotificationType } from '@/convex/lib/constants';

interface SendMessageParams {
  userId: Id<'users'>;
  message: string;
  recipientEmail: string;
  from: string;
  contact: string;
}

export function useSendMessage() {
  const sendNotification = useAction(
    api.functions.notification.sendMultiChannelNotification,
  );

  return {
    mutateAsync: async (params: SendMessageParams) => {
      try {
        await sendNotification({
          userId: params.userId,
          type: NotificationType.Feedback,
          title: `Message de ${params.from}`,
          content: `Message de ${params.from} (${params.contact}):\n\n${params.message}`,
          channels: [NotificationChannel.Email, NotificationChannel.App],
          priority: 'normal',
        });

        toast.success('Votre message a été envoyé avec succès.');

        return { success: true };
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error("Une erreur est survenue lors de l'envoi du message.");
        throw error;
      }
    },
    isPending: false,
  };
}
