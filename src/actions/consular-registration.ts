import { revalidatePath } from 'next/cache';
import type { RequestStatus } from '@prisma/client';

import { checkAuth } from '@/lib/auth/action';
import { db } from '@/lib/prisma';
import { ROUTES } from '@/schemas/routes';
/**
 * Valider une demande d'inscription consulaire
 */
export async function validateConsularRegistration(
  requestId: string,
  status: RequestStatus,
  notes?: string,
) {
  const authResult = await checkAuth(['ADMIN', 'AGENT', 'MANAGER']);
  if (authResult.error || !authResult.user) {
    throw new Error(authResult.error || 'Unauthorized');
  }

  try {
    const updatedRequest = await db.serviceRequest.update({
      where: { id: requestId },
      data: {
        status,
        lastActionAt: new Date(),
        lastActionBy: authResult.user.id,
        ...(notes && {
          notes: {
            create: {
              content: notes,
            },
          },
        }),
        actions: {
          create: {
            type: 'STATUS_CHANGE',
            userId: authResult.user.id,
            data: { status, notes },
          },
        },
      },
    });

    revalidatePath(ROUTES.dashboard.requests);
    return { success: true, data: updatedRequest };
  } catch (error) {
    console.error('Error validating consular registration:', error);
    throw new Error('Failed to validate consular registration');
  }
}

/**
 * Démarrer la production de la carte consulaire
 */
export async function startCardProduction(requestId: string) {
  const authResult = await checkAuth(['ADMIN', 'AGENT', 'MANAGER']);
  if (authResult.error || !authResult.user) {
    throw new Error(authResult.error || 'Unauthorized');
  }

  try {
    const updatedRequest = await db.serviceRequest.update({
      where: { id: requestId },
      data: {
        status: 'CARD_IN_PRODUCTION',
        lastActionAt: new Date(),
        lastActionBy: authResult.user.id,
        actions: {
          create: {
            type: 'STATUS_CHANGE',
            userId: authResult.user.id,
            data: { status: 'CARD_IN_PRODUCTION' },
          },
        },
      },
    });

    revalidatePath(ROUTES.dashboard.requests);
    return { success: true, data: updatedRequest };
  } catch (error) {
    console.error('Error starting card production:', error);
    throw new Error('Failed to start card production');
  }
}

/**
 * Marquer la carte comme prête pour le retrait
 */
export async function markCardReady(requestId: string) {
  // ... logique similaire
}

/**
 * Programmer le RDV de retrait/entretien
 */
export async function schedulePickupAppointment(requestId: string, appointmentData: any) {
  // ... logique similaire
}

/**
 * Finaliser l'inscription consulaire
 */
export async function completeRegistration(requestId: string) {
  // ... logique similaire
}
