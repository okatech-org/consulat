'use server';

import { db } from '@/lib/prisma';
import { NotificationType, RequestStatus, Notification } from '@prisma/client';

interface NotificationData {
  userId: string;
  requestId: string;
  status: RequestStatus;
  notes?: string;
}

/**
 * Crée une notification pour l'inscription consulaire
 */
async function createConsularNotification({ userId, status, notes }: NotificationData) {
  let notificationData: Pick<Notification, 'type' | 'title' | 'message'> | null = null;

  // Déterminer le type de notification en fonction du statut
  switch (status) {
    case 'SUBMITTED':
      notificationData = {
        type: NotificationType.CONSULAR_REGISTRATION_SUBMITTED,
        title: 'Demande soumise',
        message: "Votre demande d'inscription consulaire a été soumise avec succès.",
      };
      break;
    case 'VALIDATED':
      notificationData = {
        type: NotificationType.CONSULAR_REGISTRATION_VALIDATED,
        title: 'Dossier validé',
        message: "Votre dossier d'inscription consulaire a été validé.",
      };
      break;
    case 'REJECTED':
      notificationData = {
        type: NotificationType.CONSULAR_REGISTRATION_REJECTED,
        title: 'Dossier rejeté',
        message: notes || "Votre dossier d'inscription consulaire a été rejeté.",
      };
      break;
    case 'READY_FOR_PICKUP':
      notificationData = {
        type: NotificationType.CONSULAR_CARD_READY,
        title: 'Carte prête',
        message: 'Votre carte consulaire est prête pour le retrait.',
      };
      break;
    default:
      return null;
  }

  try {
    const notification = await db.notification.create({
      data: {
        ...notificationData,
        userId,
        status: 'PENDING',
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Met à jour les actions du service d'inscription consulaire pour inclure les notifications
 */
export async function updateConsularRegistrationWithNotification(
  requestId: string,
  status: RequestStatus,
  notes?: string,
) {
  try {
    // Récupérer la demande avec l'utilisateur
    const request = await db.serviceRequest.findUnique({
      where: { id: requestId },
      include: { submittedBy: true },
    });

    if (!request?.submittedBy) {
      throw new Error('Request or user not found');
    }

    // Créer la notification
    await createConsularNotification({
      userId: request.submittedBy.id,
      requestId,
      status,
      notes,
    });

    return true;
  } catch (error) {
    console.error('Error updating consular registration with notification:', error);
    return false;
  }
}
