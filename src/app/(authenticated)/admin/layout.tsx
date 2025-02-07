import { UserRole } from '@prisma/client';
import AdminSidebar from '@/app/(authenticated)/admin/_utils/components/admin-sidebar';
import { RoleGuard } from '@/components/ui/role-guard';

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RoleGuard roles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
      <AdminSidebar />
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
