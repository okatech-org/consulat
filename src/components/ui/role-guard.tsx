'use client';

import { UserRole } from '@prisma/client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Unauthorized } from '@/components/layouts/unauthorized';

type Props = {
  children: React.ReactNode;
  roles: UserRole[];
};

export function RoleGuard({ roles, children }: Readonly<Props>) {
  const user = useCurrentUser();

  if (!user) {
    return <Unauthorized />;
  }

  if (!roles.includes(user.role)) {
    return <Unauthorized />;
  }

  return <>{children}</>;
}
