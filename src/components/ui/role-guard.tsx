'use client';

import { UserRole } from '@prisma/client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Unauthorized } from '@/components/layouts/unauthorized';

type Props = {
  children: React.ReactNode;
  roles: UserRole[];
  fallback?: React.ReactNode;
};

export function RoleGuard({ roles, children, fallback }: Readonly<Props>) {
  const user = useCurrentUser();

  if (!user) {
    return fallback ?? <Unauthorized />;
  }

  if (!roles.includes(user.role)) {
    return fallback ?? <Unauthorized />;
  }

  return <>{children}</>;
}
