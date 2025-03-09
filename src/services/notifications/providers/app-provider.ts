import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/prisma';
import {
  NotificationChannel,
  NotificationRequest,
  NotificationResult,
} from '@/types/notifications';
import { NotificationProvider } from '../provider-registry';
import { tryCatch } from '@/lib/utils';
import { NotificationStatus, Prisma } from '@prisma/client';

export class AppNotificationProvider implements NotificationProvider {
  channel = NotificationChannel.APP;

  async send(request: NotificationRequest): Promise<NotificationResult> {
    const notificationId = uuidv4();
    const timestamp = new Date();

    // Préparer les données pour la création de la notification
    const notificationData: Prisma.NotificationCreateInput = {
      id: notificationId,
      user: {
        connect: {
          id: request.recipient.userId,
        },
      },
      type: request.type,
      title: request.title,
      message: request.message,
      status: NotificationStatus.SENT,
      priority: request.priority,
      actions: request.actions ? JSON.stringify(request.actions) : null,
      metadata: (request.metadata as Prisma.InputJsonValue) || {},
      expiresAt: request.expiresAt,
    };

    console.log('Notification data:', { notificationData });

    // Si un profileId est fourni, l'ajouter aux données
    if (request.recipient.userId) {
      notificationData.profile = {
        connect: {
          id: request.recipient.userId, // Utiliser l'ID utilisateur comme profileId si nécessaire
        },
      };
    }

    // Créer la notification dans la base de données
    const createNotificationPromise = db.notification.create({
      data: notificationData,
    });

    const { error } = await tryCatch(createNotificationPromise);

    if (error) {
      console.error('Error sending app notification:', error);
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
