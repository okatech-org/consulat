import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/ui/role-guard';
import AgentSidebar from './_utils/components/agent-sidebar';

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RoleGuard roles={[UserRole.AGENT]}>
      <AgentSidebar />
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
