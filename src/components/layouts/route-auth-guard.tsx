import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { hasAnyRole } from '@/lib/permissions/utils';
import { getCurrentUser } from '@/actions/user';

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
  if (!user) redirect(ROUTES.auth.login);

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
