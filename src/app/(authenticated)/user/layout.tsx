import { auth } from '@/auth';
import { RoleGuard } from '@/components/layouts/role-guard';
import { Unauthorized } from '@/components/layouts/unauthorized';
import { UserRole } from '@prisma/client';
import UserSidebar from '@/app/(authenticated)/user/_utils/components/user-sidebar';

export default async function ManagerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <RoleGuard
      roles={[UserRole.USER]}
      currentRole={session?.user.role}
      fallback={<Unauthorized />}
    >
      <UserSidebar />
      <main
        className={
          'min-h-screen w-screen overflow-auto overflow-x-hidden pb-24 pt-4 md:py-6'
        }
      >
        {children}
      </main>
    </RoleGuard>
  );
}
