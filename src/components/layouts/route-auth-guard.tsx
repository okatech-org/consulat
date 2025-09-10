import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { hasAnyRole } from '@/lib/permissions/utils';
import { getCurrentUser } from '@/actions/user';
import { headers } from 'next/headers';

export interface BaseLayoutProps {
  children: React.ReactNode;
  roles?: UserRole[];
  fallbackUrl?: string;
  fallbackComponent?: React.ReactNode;
}

export async function RouteAuthGuard({
  children,
  roles,
  fallbackUrl,
  fallbackComponent,
}: BaseLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    const headersList = await headers();
    const currentPath = headersList.get('x-current-path');
    redirect(ROUTES.auth.login + (currentPath ? `?callbackUrl=${currentPath}` : ''));
  }

  if (roles && !hasAnyRole(user, roles)) {
    if (fallbackComponent) {
      return fallbackComponent;
    }
    if (fallbackUrl) {
      redirect(fallbackUrl);
    }
  }

  return <>{children}</>;
}
