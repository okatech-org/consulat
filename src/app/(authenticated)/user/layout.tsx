import { UserRole } from '@prisma/client';
import UserSidebar from '@/app/(authenticated)/user/_utils/components/user-sidebar';
import { getCurrentUser } from '@/actions/user';
import { RouteAuthGuard } from '@/components/layouts/route-auth-guard';

export default async function ManagerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <RouteAuthGuard roles={[UserRole.USER]} currentUserRole={user?.role}>
      <UserSidebar />
      <main
        className={
          'min-h-screen w-screen overflow-auto overflow-x-hidden pb-24 pt-4 md:py-6'
        }
      >
        {children}
      </main>
    </RouteAuthGuard>
  );
}
