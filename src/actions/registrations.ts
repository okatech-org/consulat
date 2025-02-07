'use server';

import { db } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth/action';
import { Prisma, ServiceCategory, RequestStatus } from '@prisma/client';
import {
  RegistrationListingItem,
  RegistrationRequestDetails,
} from '@/types/consular-service';
import { FullProfileInclude } from '@/types';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/schemas/routes';

interface GetRegistrationsOptions {
  status?: RequestStatus;
  profileStatus?: RequestStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RegistrationsResult {
  requests: RegistrationListingItem[];
  total: number;
  filters: {
    search?: string;
    status?: RequestStatus;
    profileStatus?: RequestStatus;
  };
}

export async function getRegistrations(
  options?: GetRegistrationsOptions,
): Promise<RegistrationsResult> {
  const authResult = await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER']);

  if (authResult.error) {
    throw new Error(authResult.error);
  }

  const { status, profileStatus, search, page = 1, limit = 10 } = options || {};

  const where: Prisma.ServiceRequestWhereInput = {
    service: {
      category: ServiceCategory.REGISTRATION,
    },
    submittedBy: {
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { number: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...(profileStatus && {
        profile: {
          status: profileStatus,
        },
      }),
    },
    ...(status && { status }),
  };

  try {
    const [requests, total] = await Promise.all([
      db.serviceRequest.findMany({
        where,
        include: {
          submittedBy: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              profile: {
                select: {
                  status: true,
                },
              },
            },
          },
          service: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.serviceRequest.count({ where }),
    ]);

    return {
      requests: requests as unknown as RegistrationListingItem[],
      total,
      filters: {
        search,
        status,
        profileStatus,
      },
    };
  } catch (error) {
    console.error('Error fetching registrations:', error);
    throw new Error('Failed to fetch registrations');
  }
}

export async function getRegistrationRequestDetailsById(
  id: string,
): Promise<RegistrationRequestDetails | null> {
  await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER']);

  try {
    return db.serviceRequest.findUnique({
      where: {
        id,
      },
      include: {
        submittedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
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
  if (authResult.error || !authResult.user) {
    return { error: authResult.error };
  }

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

    console.log('Updated profile:', updatedProfile);

    // 2. Mettre à jour la demande
    const updatedRequest = await db.serviceRequest.update({
      where: { id: input.requestId },
      data: { status: input.status },
    });

    console.log('Updated request:', updatedRequest);

    revalidatePath(ROUTES.admin.registrations_review(input.profileId));
    revalidatePath(ROUTES.admin.registrations);

    return { success: true, data: { updatedProfile, updatedRequest } };
  } catch (error) {
    console.error('Error validating registration request:', error);
    return { error: 'Failed to validate registration request' };
  }
}
