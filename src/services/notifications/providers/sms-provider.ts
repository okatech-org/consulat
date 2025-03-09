import { v4 as uuidv4 } from 'uuid';
import {
  NotificationChannel,
  NotificationRequest,
  NotificationResult,
} from '@/types/notifications';
import { NotificationProvider } from '../provider-registry';
import { tryCatch } from '@/lib/utils';

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

    // Simulation d'envoi de SMS - à remplacer par un service réel (Twilio, Vonage, etc.)
    const sendSmsPromise = new Promise<void>((resolve, reject) => {
      try {
        // Ici, vous intégreriez un service SMS réel
        console.log(`[SMS SIMULATION] Sending SMS to ${request.recipient.phoneNumber}:`);
        console.log(`Title: ${request.title}`);
        console.log(`Message: ${request.message}`);

        // Vérifier si des actions sont disponibles
        const firstAction =
          request.actions && request.actions.length > 0 ? request.actions[0] : null;

        if (firstAction && firstAction.label && firstAction.url) {
          console.log(`Action: ${firstAction.label} - ${firstAction.url}`);
        }

        // Simuler un délai d'envoi
        setTimeout(resolve, 500);
      } catch (error) {
        reject(error);
      }
    });

    const { error } = await tryCatch(sendSmsPromise);

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

    return {
      id: notificationId,
      success: true,
      channel: this.channel,
      timestamp,
    };
  }
}
