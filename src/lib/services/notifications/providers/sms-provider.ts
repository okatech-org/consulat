import { v4 as uuidv4 } from 'uuid';
import {
  NotificationChannel,
  NotificationRequest,
  NotificationResult,
} from '@/types/notifications';
import { NotificationProvider } from '../provider-registry';
import { tryCatch } from '@/lib/utils';
import { sendSMS } from '@/lib/services/notifications/providers/sms';

export class SmsNotificationProvider implements NotificationProvider {
  channel = NotificationChannel.SMS;

  async send(request: NotificationRequest): Promise<NotificationResult> {
    const notificationId = uuidv4();
    const timestamp = new Date();

    // Vérifier que le numéro de téléphone est disponible
    if (!request.recipient.phoneNumber) {
      return {
        id: notificationId,
        success: false,
        channel: this.channel,
        timestamp,
        error: 'Phone number not provided',
      };
    }

    // Préparer le contenu du SMS
    let messageBody = request.message;

    // Ajouter l'action si disponible
    const firstAction =
      request.actions && request.actions.length > 0 ? request.actions[0] : null;
    if (firstAction && firstAction.label && firstAction.url) {
      messageBody += `\n\n${firstAction.label}: ${firstAction.url}`;
    }

    // Utiliser le service SMS réel
    const { error, data } = await tryCatch(
      sendSMS(request.recipient.phoneNumber, messageBody),
    );

    if (error) {
      console.error('Error sending SMS notification:', error);
      return {
        id: notificationId,
        success: false,
        channel: this.channel,
        timestamp,
        error: error.message,
      };
    }

    // Vérifier le statut de l'envoi
    if (data && data.status !== 'sent' && data.status !== 'queued') {
      console.warn(`SMS sending failed with status: ${data.status}`, {
        providerId: data.providerId,
        messageId: data.messageId,
        errorMessage: data.errorMessage,
      });

      return {
        id: notificationId,
        success: false,
        channel: this.channel,
        timestamp,
        error: data.errorMessage || `SMS sending failed with status: ${data.status}`,
      };
    }

    // Journaliser les informations du SMS envoyé
    console.info(`SMS sent successfully via ${data?.providerId}`, {
      messageId: data?.messageId,
      status: data?.status,
    });

    return {
      id: notificationId,
      success: true,
      channel: this.channel,
      timestamp,
    };
  }
}
