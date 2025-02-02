import { UserRole } from '@prisma/client';
import ManagerSidebar from '@/app/(authenticated)/admin/_utils/components/manager-sidebar';
import { RoleGuard } from '@/components/ui/role-guard';

export default async function ManagerLayout({
                                              children,
                                            }: Readonly<{ children: React.ReactNode }>) {
  return (
    <RoleGuard roles={[UserRole.ADMIN, UserRole.MANAGER]}>
      <ManagerSidebar />
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
