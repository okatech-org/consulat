'use server';

import {
  NotificationChannel,
  NotificationType,
  NotificationRequest,
  NotificationResponse,
} from '@/types/notifications';
import { sendNotification } from './notification-service';
import { sendSMSOTP } from '@/actions/email';
import { sendOTPEmail } from './providers/emails';

/**
 * Fonction simplifiée pour créer et envoyer une notification
 */
export async function notify({
  userId,
  type,
  title,
  message,
  channels = [NotificationChannel.APP],
  email,
  phoneNumber,
  actions,
  metadata,
  priority = 'normal',
  scheduledFor,
  expiresAt,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channels?: NotificationChannel[];
  email?: string;
  phoneNumber?: string;
  actions?: Array<{ label: string; url: string; primary?: boolean }>;
  metadata?: Record<string, unknown>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduledFor?: Date;
  expiresAt?: Date;
}): Promise<NotificationResponse> {
  const request: NotificationRequest = {
    type,
    title,
    message,
    channels,
    recipient: {
      userId,
      email,
      phoneNumber,
    },
    actions,
    metadata,
    priority,
    scheduledFor,
    expiresAt,
  };

  return sendNotification(request);
}

/**
 * Fonction utilitaire pour envoyer une notification d'information
 */
export async function notifyInfo(
  userId: string,
  title: string,
  message: string,
  options?: Partial<
    Omit<NotificationRequest, 'type' | 'title' | 'message' | 'recipient'>
  > & {
    email?: string;
    phoneNumber?: string;
  },
): Promise<NotificationResponse> {
  return notify({
    userId,
    type: NotificationType.FEEDBACK,
    title,
    message,
    channels: options?.channels,
    email: options?.email,
    phoneNumber: options?.phoneNumber,
    actions: options?.actions,
    metadata: options?.metadata,
    priority: options?.priority,
    scheduledFor: options?.scheduledFor,
    expiresAt: options?.expiresAt,
  });
}

/**
 * Fonction utilitaire pour envoyer une notification de rendez-vous
 */
export async function notifyAppointment(
  userId: string,
  title: string,
  message: string,
  appointmentUrl: string,
  actionLabel: string = 'Voir le rendez-vous',
  options?: Partial<
    Omit<NotificationRequest, 'type' | 'title' | 'message' | 'recipient' | 'actions'>
  > & {
    email?: string;
    phoneNumber?: string;
  },
): Promise<NotificationResponse> {
  return notify({
    userId,
    type: NotificationType.APPOINTMENT_CONFIRMATION,
    title,
    message,
    actions: [
      {
        label: actionLabel,
        url: appointmentUrl,
        primary: true,
      },
    ],
    channels: options?.channels,
    email: options?.email,
    phoneNumber: options?.phoneNumber,
    metadata: options?.metadata,
    priority: options?.priority || 'high',
    scheduledFor: options?.scheduledFor,
    expiresAt: options?.expiresAt,
  });
}

/**
 * Fonction utilitaire pour envoyer un code de validation
 */

export async function notifyValidationCode(
  message: string,
  options?: Partial<
    Omit<NotificationRequest, 'type' | 'title' | 'message' | 'recipient' | 'actions'>
  > & {
    email?: string;
    phoneNumber?: string;
  },
): Promise<boolean> {
  if (options?.email) {
    await sendOTPEmail(options?.email, message);

    return true;
  }

  if (options?.phoneNumber) {
    await sendSMSOTP(options?.phoneNumber, message);

    return true;
  }

  return false;
}
