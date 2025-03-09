import { v4 as uuidv4 } from 'uuid';
import {
  NotificationChannel,
  NotificationRequest,
  NotificationResult,
} from '@/types/notifications';
import { NotificationProvider } from '../provider-registry';
import { tryCatch } from '@/lib/utils';
import { sendNotificationEmail } from './emails';

export class EmailNotificationProvider implements NotificationProvider {
  channel = NotificationChannel.EMAIL;

  async send(request: NotificationRequest): Promise<NotificationResult> {
    const notificationId = uuidv4();
    const timestamp = new Date();

    // Vérifier que l'email est disponible
    if (!request.recipient.email) {
      return {
        id: notificationId,
        success: false,
        channel: this.channel,
        timestamp,
        error: 'Email address not provided',
      };
    }

    // Préparer les paramètres pour l'email
    const sendEmailPromise = sendNotificationEmail({
      email: request.recipient.email,
      name: request.metadata?.name as string | undefined,
      notificationTitle: request.title,
      notificationMessage: request.message,
      actionUrl: request.actions?.[0]?.url,
      actionLabel: request.actions?.[0]?.label,
    });

    const { error } = await tryCatch(sendEmailPromise);

    if (error) {
      console.error('Error sending email notification:', error);
      return {
        id: notificationId,
        success: false,
        channel: this.channel,
        timestamp,
        error: error.message,
      };
    }

    return {
      id: notificationId,
      success: true,
      channel: this.channel,
      timestamp,
    };
  }
}
