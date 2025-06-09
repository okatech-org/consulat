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
import { ManagerSessionSelect, SessionUser } from '@/types/user';
import { FullServiceRequest, FullServiceRequestInclude } from '@/types/service-request';
import { Prisma } from '@prisma/client';

function getSelectForRoles(roles: UserRole[]): Prisma.UserSelect {
  const isSuperAdmin = roles.includes(UserRole.SUPER_ADMIN);
  const isAdmin = roles.includes(UserRole.ADMIN);
  const isAgent = roles.includes(UserRole.AGENT);
  const isUser = roles.includes(UserRole.USER);
  const isManager = roles.includes(UserRole.MANAGER);

  if (isSuperAdmin) {
    return { ...UserSessionInclude };
  }

  if (isAdmin) {
    return { ...AdminSessionInclude };
  }

  if (isAgent) {
    return { ...AgentSessionInclude };
  }

  if (isUser) {
    return { ...UserSessionInclude };
  }

  if (isManager) {
    return { ...ManagerSessionSelect };
  }

  return { ...UserSessionInclude };
}

export async function getUserSession(
  id: string,
  roles: UserRole[],
): Promise<SessionUser | null> {
  const select = getSelectForRoles(roles);

  return await db.user.findUnique({
    where: { id: id },
    select,
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
