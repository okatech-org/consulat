import { ServerRoleGuard } from '@/lib/permissions/utils';
import SuperAdminDashboard from '../../../components/dashboards/superadmin-dashboard';
import { getCurrentUser } from '@/actions/user';
import AgentDashboard from '../../../components/dashboards/agent-dashboard';
import AdminDashboard from '../../../components/dashboards/admin-dashboard';
import { ManagerDashboard } from '../../../components/dashboards/manager-dashboard';
import type { SessionUser } from '@/types/user';
import { ROUTES } from '@/schemas/routes';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (user?.role === 'INTEL_AGENT') {
    redirect(ROUTES.intel.base);
  }

  if (user?.role === 'USER') {
    redirect(ROUTES.user.base);
  }

  return (
    <>
      <ServerRoleGuard roles={['SUPER_ADMIN']} user={user as SessionUser}>
        <SuperAdminDashboard />
      </ServerRoleGuard>
      <ServerRoleGuard roles={['ADMIN']} user={user as SessionUser}>
        <AdminDashboard />
      </ServerRoleGuard>
      <ServerRoleGuard roles={['MANAGER']} user={user as SessionUser}>
        <ManagerDashboard />
      </ServerRoleGuard>
      <ServerRoleGuard roles={['AGENT']} user={user as SessionUser}>
        <AgentDashboard />
      </ServerRoleGuard>
    </>
  );
}
