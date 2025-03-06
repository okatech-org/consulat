import { auth } from '@/auth';
import { UserRole } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { hasAnyRole } from '../permissions/utils';

export async function checkAuth(roles?: UserRole[]) {
  const t = await getTranslations('errors');
  const session = await auth();

  if (!session?.user) {
    throw new Error(t('auth.unauthorized'), { cause: 'UNAUTHORIZED' });
  }

  if (roles && !hasAnyRole(session.user, roles)) {
    throw new Error(t('auth.forbidden'), { cause: 'FORBIDDEN' });
  }

  return { user: session.user };
}
