'use server';

import { revalidatePath } from 'next/cache';
import { NoteType, type RequestStatus } from '@prisma/client';

import { checkAuth } from '@/lib/auth/action';
import { db } from '@/server/db';
import { ROUTES } from '@/schemas/routes';
import { updateConsularRegistrationWithNotification } from '@/lib/services/notifications/consular-registration';
import { generateConsularCardNumber } from '@/actions/consular-card';

/**
 * Valider une demande d'inscription consulaire
 */
export async function validateConsularRegistration(
  requestId: string,
  profileId: string,
  residenceCountryCode: string,
  status: RequestStatus,
  validityYears: number = 3,
  notes?: string,
  organizationId?: string,
) {
  const authResult = await checkAuth(['ADMIN', 'AGENT', 'MANAGER', 'SUPER_ADMIN']);

  // Si le statut est VALIDATED, générer les informations de la carte
  const cardData =
    status === 'VALIDATED'
      ? {
          cardNumber: await generateConsularCardNumber(
            profileId,
            residenceCountryCode,
            organizationId ?? null,
          ),
          cardIssuedAt: new Date(),
          cardExpiresAt: new Date(Date.now() + validityYears * 365 * 24 * 60 * 60 * 1000), // {validityYears} an(s)
        }
      : {};

  await db.profile.update({
    where: { id: profileId },
    data: {
      status,
      ...cardData,
    },
  });

  const updatedRequest = await db.serviceRequest.update({
    where: { id: requestId },
    data: {
      status: 'VALIDATED',
      lastActionAt: new Date(),
      lastActionBy: authResult.user.id,
      actions: {
        create: {
          type: 'STATUS_CHANGE',
          userId: authResult.user.id,
          data: { status: 'VALIDATED', notes },
        },
      },
    },
    include: {
      submittedBy: true,
    },
  });

  if (notes) {
    await db.note.create({
      data: {
        content: notes,
        type: NoteType.INTERNAL,
        serviceRequest: {
          connect: { id: requestId },
        },
        author: {
          connect: { id: authResult.user.id },
        },
      },
    });
  }

  await updateConsularRegistrationWithNotification(requestId, status, notes);

  revalidatePath(ROUTES.dashboard.requests);
  return updatedRequest;
}

export async function updateConsularRegistrationStatus(
  requestId: string,
  profileId: string,
  status: RequestStatus,
  notes?: string,
) {
  const authResult = await checkAuth(['ADMIN', 'AGENT', 'MANAGER', 'SUPER_ADMIN']);

  try {
    await db.profile.update({
      where: { id: profileId },
      data: {
        status,
      },
    });

    const updatedRequest = await db.serviceRequest.update({
      where: { id: requestId },
      data: {
        status,
        lastActionAt: new Date(),
        lastActionBy: authResult.user.id,
        actions: {
          create: {
            type: 'STATUS_CHANGE',
            userId: authResult.user.id,
            data: { status, notes },
          },
        },
      },
    });

    if (notes) {
      await db.note.create({
        data: {
          content: notes,
          type: NoteType.FEEDBACK,
          serviceRequest: {
            connect: { id: requestId },
          },
          author: {
            connect: { id: authResult.user.id },
          },
        },
      });
    }

    await updateConsularRegistrationWithNotification(requestId, status, notes);

    revalidatePath(ROUTES.dashboard.requests);
    return { success: true, data: updatedRequest };
  } catch (error) {
    console.error('Error updating consular registration status:', error);
    throw new Error('Failed to update consular registration status');
  }
}

/**
 * Démarrer la production de la carte consulaire
 */
export async function startCardProduction(requestId: string) {
  const authResult = await checkAuth(['ADMIN', 'AGENT', 'MANAGER']);

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

    await updateConsularRegistrationWithNotification(requestId, 'CARD_IN_PRODUCTION');

    revalidatePath(ROUTES.dashboard.requests);
    return { success: true, data: updatedRequest };
  } catch (error) {
    console.error('Error starting card production:', error);
    throw new Error('Failed to start card production');
  }
}
