import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { hasAnyRole } from '@/lib/permissions/utils';
import { SessionUser } from '@/types';

export interface BaseLayoutProps {
  children: React.ReactNode;
  roles?: UserRole[];
  fallbackUrl?: string;
  fallbackComponent?: React.ReactNode;
  user?: SessionUser;
}

export function RouteAuthGuard({
  children,
  roles,
  user,
  fallbackUrl,
  fallbackComponent,
}: BaseLayoutProps) {
  if (!user) redirect(ROUTES.auth.login);

  if (!hasAnyRole(user, roles)) {
    if (fallbackComponent) {
      return fallbackComponent;
    }
    if (fallbackUrl) {
      redirect(fallbackUrl);
    }
  }

  return <>{children}</>;
}
