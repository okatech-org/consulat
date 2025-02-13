'use server';

import { db } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth/action';
import { RequestStatus } from '@prisma/client';

export async function getAdminStats() {
  const authResult = await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER']);
  if (authResult.error) return null;

  try {
    const completedRequests = await db.serviceRequest.count({
      where: { status: RequestStatus.COMPLETED },
    });

    const processingRequests = await db.serviceRequest.count({
      where: {
        status: {
          in: [RequestStatus.IN_REVIEW, RequestStatus.ADDITIONAL_INFO_NEEDED],
        },
      },
    });

    const validatedProfiles = await db.profile.count({
      where: { status: RequestStatus.VALIDATED },
    });

    const pendingProfiles = await db.profile.count({
      where: {
        status: {
          in: [RequestStatus.SUBMITTED, RequestStatus.IN_REVIEW],
        },
      },
    });

    return {
      completedRequests,
      processingRequests,
      validatedProfiles,
      pendingProfiles,
    };
  } catch (error) {
    console.error('Error fetching data for admin dashboard:', error);
    return null;
  }
}
