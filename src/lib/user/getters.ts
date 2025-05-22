'use server';

import { db } from '@/lib/prisma';
import {
  AdminSessionInclude,
  AgentSessionInclude,
  FullProfile,
  FullProfileInclude,
  FullUser,
  FullUserInclude,
  UserSessionInclude,
} from '@/types';
import { ServiceCategory, ServiceRequest, UserRole } from '@prisma/client';
import { SessionUser } from '@/types/user';
import { FullServiceRequest, FullServiceRequestInclude } from '@/types/service-request';

export async function getUserSession(
  id: string,
  roles: UserRole[],
): Promise<SessionUser | null> {
  const isSuperAdmin = roles.includes(UserRole.SUPER_ADMIN);
  const isAdmin = roles.includes(UserRole.ADMIN);
  const isAgent = roles.includes(UserRole.AGENT);
  const isUser = roles.includes(UserRole.USER);

  // @ts-expect-error - We need to handle the case where the user is not in any role
  return await db.user.findUnique({
    where: { id: id },
    ...(isSuperAdmin && { ...UserSessionInclude }),
    ...(isAdmin && { ...AdminSessionInclude }),
    ...(isAgent && { ...AgentSessionInclude }),
    ...(isUser && { ...UserSessionInclude }),
  });
}

export async function getUserById(
  id: string | undefined | null,
): Promise<FullUser | null> {
  if (!id) {
    return null;
  }

  try {
    return await db.user.findUnique({
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
      where: { user: { id: id } },
      ...FullProfileInclude,
    });
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getProfileRegistrationRequest(
  profileId: string,
): Promise<FullServiceRequest | null> {
  return db.serviceRequest.findFirst({
    where: { requestedForId: profileId, serviceCategory: ServiceCategory.REGISTRATION },
    ...FullServiceRequestInclude,
  }) as unknown as FullServiceRequest | null;
}

export async function getUserFullProfileById(id: string): Promise<FullProfile | null> {
  return db.profile.findUnique({
    where: { id: id },
    ...FullProfileInclude,
  });
}

export async function getServiceRequestsByProfileId(
  profileId: string,
): Promise<ServiceRequest[]> {
  return db.serviceRequest.findMany({
    where: { requestedForId: profileId },
    include: {
      service: true,
    },
  });
}
