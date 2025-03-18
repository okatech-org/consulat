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
import { UserRole } from '@prisma/client';

export async function getUserSession(id: string, roles: UserRole[]) {
  const isSuperAdmin = roles.includes(UserRole.SUPER_ADMIN);
  const isAdmin = roles.includes(UserRole.ADMIN);
  const isAgent = roles.includes(UserRole.AGENT);
  const isUser = roles.includes(UserRole.USER);

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

export async function getUserFullProfileById(id: string): Promise<FullProfile | null> {
  return db.profile.findUnique({
    where: { id: id },
    ...FullProfileInclude,
  });
}
