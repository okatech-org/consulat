import { UserRole } from '@prisma/client';
import { getCurrentUser } from '@/actions/user';
import UserSidebar from './_utils/components/user-sidebar';
import { ServerRoleGuard } from '@/lib/permissions/utils';

export default async function ManagerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <ServerRoleGuard roles={[UserRole.USER]} user={user}>
      <UserSidebar />
      <main
        className={
          'min-h-screen w-screen overflow-auto overflow-x-hidden pb-24 pt-4 md:py-6'
        }
      >
        {children}
      </main>
    </ServerRoleGuard>
  );
}
