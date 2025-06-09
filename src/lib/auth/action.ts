import { UserRole } from '@prisma/client';
import { hasAnyRole } from '../permissions/utils';
import { auth } from './auth';
import { headers } from 'next/headers';

export async function checkAuth(roles?: UserRole[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error('unauthorized');
  }

  if (roles && !hasAnyRole(session?.user, roles)) {
    throw new Error('forbidden');
  }

  return { user: session.user };
}
