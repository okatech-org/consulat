import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';

export interface BaseLayoutProps {
  children: React.ReactNode;
  roles: UserRole[];
  fallbackUrl?: string;
  currentUserRole?: UserRole;
}

export function RouteAuthGuard({
  children,
  roles,
  currentUserRole,
  fallbackUrl,
}: BaseLayoutProps) {
  if (!currentUserRole) {
    if (fallbackUrl) {
      redirect(fallbackUrl);
    } else {
      return redirect(ROUTES.auth.login);
    }
  }

  if (!roles.includes(currentUserRole)) {
    if (fallbackUrl) {
      redirect(fallbackUrl);
    } else {
      return redirect(ROUTES.auth.login);
    }
  }

  return <>{children}</>;
}
