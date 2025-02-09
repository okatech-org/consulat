import { UserRole } from '@prisma/client';
import { Unauthorized } from './unauthorized';
import { redirect } from 'next/navigation';

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
      return <Unauthorized />;
    }
  }

  if (!roles.includes(currentUserRole)) {
    if (fallbackUrl) {
      redirect(fallbackUrl);
    } else {
      return <Unauthorized />;
    }
  }

  return <>{children}</>;
}
