'use server';

import { db } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth/action';
import { RequestStatus } from '@prisma/client';

export async function getAdminStats() {
  await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER']);

  const completedRequests = await db.serviceRequest.count({
    where: { status: RequestStatus.COMPLETED },
  });

  const processingRequests = await db.serviceRequest.count({
    where: {
      status: {
        in: [RequestStatus.SUBMITTED, RequestStatus.PENDING],
      },
    },
  });

  const validatedProfiles = await db.profile.count({
    where: { status: RequestStatus.VALIDATED },
  });

  const pendingProfiles = await db.profile.count({
    where: {
      status: {
        in: [RequestStatus.SUBMITTED, RequestStatus.PENDING],
      },
    },
  });

  return {
    completedRequests,
    processingRequests,
    validatedProfiles,
    pendingProfiles,
  };
}
