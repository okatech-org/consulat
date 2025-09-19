import { UserRole } from '@prisma/client';
import { hasAnyRole } from '../permissions/utils';
import { getCurrentUser } from '@/lib/auth/utils';

export async function checkAuth(roles?: UserRole[]) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('unauthorized');
  }

  if (roles && !hasAnyRole(user, roles)) {
    throw new Error('forbidden');
  }

  return { user };
}
