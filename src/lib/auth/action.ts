import { auth } from '@/auth';
import { UserRole } from '@prisma/client';
import { hasAnyRole } from '../permissions/utils';
import { SessionUser } from '@/types/user';

export async function checkAuth(roles?: UserRole[]) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('unauthorized');
  }

  if (roles && !hasAnyRole(session?.user, roles)) {
    throw new Error('forbidden');
  }

  return { user: session.user as SessionUser };
}
