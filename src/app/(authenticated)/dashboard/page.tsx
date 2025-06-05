import { ServerRoleGuard } from '@/lib/permissions/utils';
import SuperAdminDashboard from '../../../components/dashboards/superadmin-dashboard';
import { getCurrentUser } from '@/actions/user';
import AgentDashboard from '../../../components/dashboards/agent-dashboard';
import AdminDashboard from '../../../components/dashboards/admin-dashboard';
import { ManagerDashboard } from '../../../components/dashboards/manager-dashboard';
import { SessionUser } from '@/types/user';

export default async function DashboardPage() {
  const user = (await getCurrentUser()) as SessionUser;

  return (
    <>
      <ServerRoleGuard roles={['SUPER_ADMIN']} user={user}>
        <SuperAdminDashboard />
      </ServerRoleGuard>
      <ServerRoleGuard roles={['ADMIN']} user={user}>
        <AdminDashboard />
      </ServerRoleGuard>
      <ServerRoleGuard roles={['MANAGER']} user={user}>
        <ManagerDashboard />
      </ServerRoleGuard>
      <ServerRoleGuard roles={['AGENT']} user={user}>
        <AgentDashboard />
      </ServerRoleGuard>
    </>
  );
}
