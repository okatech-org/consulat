'use server';

import { notify, notifyInfo, notifyAppointment } from '@/lib/services/notifications';
import { NotificationChannel, NotificationType } from '@/types/notifications';

/**
 * Exemple d'utilisation du service de notification pour informer un utilisateur
 * d'une mise à jour du système
 */
export async function notifyUserAboutUpdate(userId: string) {
  return notifyInfo(
    userId,
    'Mise à jour système',
    'Le système a été mis à jour avec de nouvelles fonctionnalités.',
    {
      channels: [NotificationChannel.APP, NotificationChannel.EMAIL],
      email: 'user@example.com',
      actions: [
        {
          label: 'Voir les changements',
          url: 'https://consulat.ga/changelog',
          primary: true,
        },
      ],
    },
  );
}

/**
 * Exemple d'utilisation du service de notification pour informer un utilisateur
 * d'un nouveau rendez-vous
 */
export async function notifyUserAboutAppointment(
  userId: string,
  appointmentId: string,
  appointmentDate: Date,
  serviceName: string,
) {
  const formattedDate = appointmentDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return notifyAppointment(
    userId,
    `Confirmation de rendez-vous: ${serviceName}`,
    `Votre rendez-vous pour ${serviceName} est confirmé pour le ${formattedDate}.`,
    `https://consulat.ga/appointments/${appointmentId}`,
    {
      channels: [
        NotificationChannel.APP,
        NotificationChannel.EMAIL,
        NotificationChannel.SMS,
      ],
      email: 'user@example.com',
      phoneNumber: '+33612345678',
      priority: 'high',
    },
  );
}

/**
 * Exemple d'utilisation avancée du service de notification avec configuration personnalisée
 */
export async function sendCustomNotification(
  userId: string,
  title: string,
  message: string,
  options: {
    type: NotificationType;
    email?: string;
    phoneNumber?: string;
    actions?: Array<{ label: string; url: string; primary?: boolean }>;
    channels?: NotificationChannel[];
  },
) {
  return notify({
    userId,
    type: options.type,
    title,
    message,
    channels: options.channels || [NotificationChannel.APP],
    email: options.email,
    phoneNumber: options.phoneNumber,
    actions: options.actions,
    metadata: {
      source: 'custom_notification',
      timestamp: new Date().toISOString(),
    },
    priority: 'normal',
  });
}
