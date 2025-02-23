'use server';

import { db } from '@/lib/prisma';
import { FullProfile, FullProfileInclude, FullUser, FullUserInclude } from '@/types';
import { FullServiceRequestInclude } from '@/types/service-request';
import { ServiceCategory } from '@prisma/client';

export async function getUserById(
  id: string | undefined | null,
): Promise<FullUser | null> {
  if (!id) {
    return null;
  }

  try {
    return await db.user.findFirst({
      where: {
        id: id,
      },
      ...FullUserInclude,
    });
  } catch {
    return null;
  }
}

export async function getUserFullProfile(id: string): Promise<FullProfile | null> {
  try {
    return db.profile.findFirst({
      where: { userId: id },
      ...FullProfileInclude,
    });
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getRegistrationRequestsFromUser(id: string) {
  try {
    return db.serviceRequest.findFirst({
      where: { submittedById: id, serviceCategory: ServiceCategory.REGISTRATION },
      ...FullServiceRequestInclude,
    });
  } catch (e) {
    console.error(e);
    return null;
  }
}
