import {
  NotificationChannel,
  NotificationRequest,
  NotificationResult,
} from '@/types/notifications';

// Interface commune pour tous les providers de notification
export interface NotificationProvider {
  channel: NotificationChannel;
  send: (request: NotificationRequest) => Promise<NotificationResult>;
}

// Map des providers disponibles
const providers: Record<NotificationChannel, NotificationProvider | undefined> = {
  [NotificationChannel.APP]: undefined,
  [NotificationChannel.EMAIL]: undefined,
  [NotificationChannel.SMS]: undefined,
  [NotificationChannel.PUSH]: undefined,
  [NotificationChannel.WEBHOOK]: undefined,
};

/**
 * Récupère le provider approprié pour un canal donné
 */
export function getNotificationProvider(
  channel: NotificationChannel,
): NotificationProvider {
  const provider = providers[channel];

  if (!provider) {
    throw new Error(`No provider registered for channel: ${channel}`);
  }

  return provider;
}

/**
 * Enregistre un nouveau provider ou remplace un existant
 */
export function registerNotificationProvider(provider: NotificationProvider): void {
  providers[provider.channel] = provider;
}
