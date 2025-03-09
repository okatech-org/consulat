'use server';

import { v4 as uuidv4 } from 'uuid';
import {
  NotificationRequest,
  NotificationResponse,
  NotificationResult,
  notificationSchema,
} from '@/types/notifications';
import { tryCatch } from '@/lib/utils';
import { getNotificationProvider } from './provider-registry';
import { AppNotificationProvider } from './providers/app-provider';
import { EmailNotificationProvider } from './providers/email-provider';
import { SmsNotificationProvider } from './providers/sms-provider';
import { registerNotificationProvider } from './provider-registry';
import { db } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Enregistrer les providers disponibles
registerNotificationProvider(new AppNotificationProvider());
registerNotificationProvider(new EmailNotificationProvider());
registerNotificationProvider(new SmsNotificationProvider());

/**
 * Enregistre l'historique d'une notification envoyée
 */
async function logNotification(data: {
  requestId: string;
  notificationId?: string;
  userId: string;
  channel: string;
  success: boolean;
  error?: string;
}): Promise<void> {
  try {
    await db.notificationLog.create({
      data: {
        requestId: data.requestId,
        notificationId: data.notificationId,
        userId: data.userId,
        channel: data.channel,
        success: data.success,
        error: data.error,
      },
    });
  } catch (error) {
    console.error('Error logging notification:', error);
    // Ne pas propager l'erreur pour éviter d'interrompre le flux principal
  }
}

/**
 * Planifie une notification pour un envoi ultérieur
 */
async function scheduleNotification(request: NotificationRequest): Promise<void> {
  try {
    // Convertir la requête en objet JSON compatible avec Prisma
    const jsonPayload: Prisma.InputJsonValue = JSON.parse(JSON.stringify(request));

    await db.scheduledNotification.create({
      data: {
        userId: request.recipient.userId,
        payload: jsonPayload,
        scheduledFor: request.scheduledFor!,
      },
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
}

/**
 * Service principal de notification qui orchestre l'envoi de notifications
 * à travers différents canaux
 */
export async function sendNotification(
  request: NotificationRequest,
): Promise<NotificationResponse> {
  // Générer un ID unique pour cette requête de notification
  const requestId = uuidv4();

  // Valider la requête avec Zod
  const { error: validationError, data: validatedRequest } = await tryCatch(
    Promise.resolve().then(() => notificationSchema.parse(request)),
  );

  if (validationError) {
    console.error('Notification validation error:', validationError);
    return {
      requestId,
      results: [],
      successful: false,
      timestamp: new Date(),
    };
  }

  // Vérifier si la notification est programmée pour plus tard
  if (validatedRequest?.scheduledFor && validatedRequest.scheduledFor > new Date()) {
    await scheduleNotification(validatedRequest);
    return {
      requestId,
      results: [],
      successful: true,
      timestamp: new Date(),
    };
  }

  // Envoyer la notification sur tous les canaux demandés
  const results: NotificationResult[] = [];

  for (const channel of validatedRequest?.channels || []) {
    try {
      // Obtenir le provider approprié pour ce canal
      const provider = getNotificationProvider(channel);

      // Envoyer la notification via ce provider
      const result = await provider.send(validatedRequest!);
      results.push(result);

      // Enregistrer l'historique de notification
      await logNotification({
        requestId,
        notificationId: channel === 'app' ? result.id : undefined,
        userId: validatedRequest!.recipient.userId,
        channel,
        success: result.success,
        error: result.error,
      });
    } catch (error) {
      console.error(`Error sending notification via ${channel}:`, error);

      const errorResult = {
        id: uuidv4(),
        success: false,
        channel,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      results.push(errorResult);

      // Enregistrer l'échec dans l'historique
      await logNotification({
        requestId,
        userId: validatedRequest!.recipient.userId,
        channel,
        success: false,
        error: errorResult.error,
      });
    }
  }

  // Déterminer si l'opération globale est un succès
  const successful = results.some((result) => result.success);

  return {
    requestId,
    results,
    successful,
    timestamp: new Date(),
  };
}

/**
 * Traite les notifications programmées qui sont arrivées à échéance
 * Cette fonction peut être appelée par un cron job
 */
export async function processScheduledNotifications(): Promise<void> {
  const now = new Date();

  try {
    // Récupérer les notifications programmées à traiter
    const scheduledNotifications = await db.scheduledNotification.findMany({
      where: {
        scheduledFor: {
          lte: now,
        },
        processed: false,
      },
      take: 50, // Traiter par lots pour éviter de surcharger le système
    });

    for (const scheduledNotification of scheduledNotifications) {
      try {
        // Convertir le payload JSON en objet NotificationRequest
        const notificationRequest = JSON.parse(
          JSON.stringify(scheduledNotification.payload),
        ) as NotificationRequest;

        await sendNotification(notificationRequest);

        // Marquer comme traitée
        await db.scheduledNotification.update({
          where: {
            id: scheduledNotification.id,
          },
          data: {
            processed: true,
            processedAt: new Date(),
          },
        });
      } catch (error) {
        console.error(
          `Error processing scheduled notification ${scheduledNotification.id}:`,
          error,
        );
      }
    }
  } catch (error) {
    console.error('Error processing scheduled notifications:', error);
  }
}
