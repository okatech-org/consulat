import { UserRole } from '@prisma/client';
import { getCurrentUser } from '@/actions/user';
import { ServerRoleGuard } from '@/lib/permissions/utils';

export default async function ManagerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <ServerRoleGuard roles={[UserRole.USER]} user={user}>
      {children}
    </ServerRoleGuard>
  );
}
