'use server';

import { db } from '@/lib/prisma';
import { NotificationType, RequestStatus, Notification, User } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { ROUTES } from '@/schemas/routes';
import { notify } from '@/services/notifications';
import { NotificationChannel } from '@/types/notifications';
import { env } from '@/lib/env';

interface NotificationData {
  user: User;
  requestId: string;
  status: RequestStatus;
  notes?: string;
}

// Interface pour les données de notification avec les actions
interface NotificationDataWithActions
  extends Pick<Notification, 'type' | 'title' | 'message'> {
  actions?: {
    label: string;
    url: string;
  };
}

/**
 * Crée une notification pour l'inscription consulaire
 */
async function createConsularNotification({
  user,
  status,
  notes,
  requestId,
}: NotificationData) {
  const t = await getTranslations('messages.requests.notifications');
  let notificationData: NotificationDataWithActions | null = null;

  // Déterminer le type de notification en fonction du statut
  switch (status) {
    case 'SUBMITTED':
      notificationData = {
        type: NotificationType.CONSULAR_REGISTRATION_SUBMITTED,
        title: t('consular_registration_submitted'),
        message: t('messages.submitted'),
        actions: {
          label: t('actions.view_request'),
          url: `${ROUTES.user.requests}/${requestId}`,
        },
      };
      break;
    case 'VALIDATED':
      notificationData = {
        type: NotificationType.CONSULAR_REGISTRATION_VALIDATED,
        title: t('consular_registration_validated'),
        message: t('messages.validated'),
        actions: {
          label: t('actions.view_profile'),
          url: `${ROUTES.user.profile}?userId=${user.id}`,
        },
      };
      break;
    case 'REJECTED':
      notificationData = {
        type: NotificationType.CONSULAR_REGISTRATION_REJECTED,
        title: t('consular_registration_rejected'),
        message: notes || t('messages.rejected'),
        actions: {
          label: t('actions.view_request'),
          url: `${ROUTES.user.requests}/${requestId}`,
        },
      };
      break;
    case 'READY_FOR_PICKUP':
      notificationData = {
        type: NotificationType.CONSULAR_CARD_READY,
        title: t('consular_card_ready'),
        message: t('messages.ready_for_pickup'),
        actions: {
          label: t('actions.schedule_pickup'),
          url: `${ROUTES.user.new_appointment}?serviceRequestId=${requestId}&type=DOCUMENT_COLLECTION`,
        },
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

    // Utiliser notre service de notification
    const result = await notify({
      userId: user.id,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      channels: [NotificationChannel.APP, NotificationChannel.EMAIL],
      email: user?.email || undefined,
      priority: 'normal',
      actions: notificationData.actions
        ? [
            {
              label: notificationData.actions.label,
              url: `${env.NEXT_PUBLIC_URL}${notificationData.actions.url}`,
              primary: true,
            },
          ]
        : undefined,
      metadata: {
        requestId,
        status,
      },
    });

    return result.results[0]?.id || null;
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
      user: request.submittedBy,
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
