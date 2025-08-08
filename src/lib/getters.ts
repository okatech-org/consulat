'use server';

import { db } from '@/server/db';
import { ServiceCategory, type ServiceRequest, UserRole } from '@prisma/client';
import { Prisma } from '@prisma/client';
import {
  FullServiceRequestInclude,
  type FullServiceRequest,
} from '@/lib/service-request';
import {
  ManagerSessionSelect,
  UserSessionSelect,
  type SessionUser,
  AgentSessionInclude,
  AdminSessionInclude,
} from '@/lib/user';
import { type FullProfile, FullProfileInclude } from '@/lib/profile';

function getSelectForRoles(role: UserRole): Prisma.UserSelect {
  const includesByRole = {
    [UserRole.SUPER_ADMIN]: { ...UserSessionSelect },
    [UserRole.ADMIN]: { ...AdminSessionInclude },
    [UserRole.AGENT]: { ...AgentSessionInclude },
    [UserRole.USER]: { ...UserSessionSelect },
    [UserRole.MANAGER]: { ...ManagerSessionSelect },
  };

  return includesByRole[role];
}

export async function getUserSession(
  id: string,
  role: UserRole,
): Promise<SessionUser | null> {
  const select = getSelectForRoles(role);

  return await db.user.findUnique({
    where: { id: id },
    select,
  });
}

export async function getUserById(
  id: string | undefined | null,
): Promise<SessionUser | null> {
  if (!id) {
    return null;
  }

  try {
    return await db.user.findUnique({
      where: {
        id: id,
      },
      select: UserSessionSelect,
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
    where: { userId: id },
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
