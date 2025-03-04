'use server';

import { db } from '@/lib/prisma';
import { NotificationType, RequestStatus, Notification } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { ROUTES } from '@/schemas/routes';

interface NotificationData {
  userId: string;
  requestId: string;
  status: RequestStatus;
  notes?: string;
}

/**
 * Crée une notification pour l'inscription consulaire
 */
async function createConsularNotification({
  userId,
  status,
  notes,
  requestId,
}: NotificationData) {
  const t = await getTranslations('messages.requests.notifications');
  let notificationData: Pick<Notification, 'type' | 'title' | 'message'> | null = null;

  // Déterminer le type de notification en fonction du statut
  switch (status) {
    case 'SUBMITTED':
      notificationData = {
        type: NotificationType.CONSULAR_REGISTRATION_SUBMITTED,
        title: t('consular_registration_submitted'),
        message: t('messages.submitted'),
      };
      break;
    case 'VALIDATED':
      notificationData = {
        type: NotificationType.CONSULAR_REGISTRATION_VALIDATED,
        title: t('consular_registration_validated'),
        message: t('messages.validated'),
      };
      break;
    case 'REJECTED':
      notificationData = {
        type: NotificationType.CONSULAR_REGISTRATION_REJECTED,
        title: t('consular_registration_rejected'),
        message: notes || t('messages.rejected'),
      };
      break;
    case 'READY_FOR_PICKUP':
      notificationData = {
        type: NotificationType.CONSULAR_CARD_READY,
        title: 'Votre carte consulaire est prête pour le retrait.',
        message: `<p>Votre carte consulaire est prête à être récupérée. Veuillez vous rendre à l\'adresse suivante : <a class="link text-blue-500" href="{${ROUTES.user.new_appointment}?serviceRequestId=${requestId}&type=DOCUMENT_COLLECTION}">Prendre rendez-vous pour le retrait</a></p>`,
      };
      break;
    case 'COMPLETED':
      notificationData = {
        type: NotificationType.CONSULAR_REGISTRATION_COMPLETED,
        title: t('consular_registration_completed'),
        message: t('messages.completed'),
      };
      break;
    default:
      return null;
  }

  try {
    if (!notificationData) return null;

    const notification = await db.notification.create({
      data: {
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
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
