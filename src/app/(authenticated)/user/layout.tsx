import { UserRole } from '@prisma/client';
import UserSidebar from '@/app/(authenticated)/user/_utils/components/user-sidebar';
import { RoleGuard } from '@/components/ui/role-guard';

export default async function ManagerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RoleGuard roles={[UserRole.USER]}>
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
