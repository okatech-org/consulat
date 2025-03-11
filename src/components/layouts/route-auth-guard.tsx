import { User, UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { hasAnyRole } from '@/lib/permissions/utils';

export interface BaseLayoutProps {
  children: React.ReactNode;
  roles?: UserRole[];
  fallbackUrl?: string;
  fallbackComponent?: React.ReactNode;
  user?: User;
}

export function RouteAuthGuard({
  children,
  roles,
  user,
  fallbackUrl,
  fallbackComponent,
}: BaseLayoutProps) {
  if (!user) {
    if (fallbackComponent) {
      return fallbackComponent;
    }
    if (fallbackUrl) {
      redirect(fallbackUrl);
    } else {
      return redirect(ROUTES.auth.login);
    }
  }

  if (roles && !hasAnyRole(user, roles)) {
    if (fallbackUrl) {
      redirect(fallbackUrl);
    } else {
      return redirect(ROUTES.auth.login);
    }
  }

  return <>{children}</>;
}
