'use server';

import { db } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth/action';
import { RequestStatus } from '@prisma/client';
import {
  RegistrationListingItem,
  RegistrationRequestDetails,
} from '@/types/consular-service';
import { FullProfileInclude } from '@/types';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/schemas/routes';

export interface GetRegistrationsOptions {
  search?: string;
  status?: RequestStatus[];
  profileStatus?: RequestStatus[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RegistrationsResult {
  requests: RegistrationListingItem[];
  total: number;
  filters: GetRegistrationsOptions;
}

export async function getRegistrationRequestDetailsById(
  id: string,
): Promise<RegistrationRequestDetails | null> {
  await checkAuth();

  try {
    return db.serviceRequest.findUnique({
      where: {
        id,
      },
      include: {
        submittedBy: {
          select: {
            name: true,
            email: true,
            phoneNumber: true,
            documents: true,
            profile: FullProfileInclude,
          },
        },
        service: true,
      },
    });
  } catch (error) {
    console.error('Error fetching registration request details:', error);
    return null;
  }
}

interface ValidateRequestInput {
  requestId: string;
  profileId: string;
  status: RequestStatus;
  notes?: string;
}

export async function validateRegistrationRequest(input: ValidateRequestInput) {
  const authResult = await checkAuth(['ADMIN', 'SUPER_ADMIN']);

  try {
    const updatedProfile = await db.profile.update({
      where: { id: input.profileId },
      data: {
        status: input.status,
        validationNotes: input.notes,
        validatedAt: new Date(),
        validatedBy: authResult.user.id,
      },
    });

    // 2. Mettre à jour la demande
    const updatedRequest = await db.serviceRequest.update({
      where: { id: input.requestId },
      data: { status: input.status },
    });

    revalidatePath(ROUTES.dashboard.registrations_review(input.profileId));
    revalidatePath(ROUTES.dashboard.registrations);

    return { success: true, data: { updatedProfile, updatedRequest } };
  } catch (error) {
    console.error('Error validating registration request:', error);
    return { error: 'Failed to validate registration request' };
  }
}
