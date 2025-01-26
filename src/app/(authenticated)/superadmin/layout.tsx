import { UserRole } from '@prisma/client';
import SuperAdminSidebar from '@/app/(authenticated)/superadmin/_utils/components/sa-sidebar';
import { RoleGuard } from '@/components/ui/role-guard';

export default async function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RoleGuard roles={[UserRole.SUPER_ADMIN]}>
      <SuperAdminSidebar />
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
