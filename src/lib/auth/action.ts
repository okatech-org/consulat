import { UserRole } from '@prisma/client';
import { hasAnyRole } from '../permissions/utils';
import type { SessionUser } from '@/types';
import { auth } from '@/server/auth';

export async function checkAuth(roles?: UserRole[]) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('unauthorized');
  }

  if (roles && !hasAnyRole(session?.user as unknown as SessionUser, roles)) {
    throw new Error('forbidden');
  }

  return { user: session.user };
}
