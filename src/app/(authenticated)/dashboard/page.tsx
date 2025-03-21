import { ServerRoleGuard } from '@/lib/permissions/utils';
import SuperAdminDashboard from './_utils/components/superadmin';
import { getCurrentUser } from '@/actions/user';
import AgentDashboard from './_utils/components/agent';
import AdminDashboard from './(admin)/_utils/dashboard';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <>
      <ServerRoleGuard roles={['SUPER_ADMIN']} user={user}>
        <SuperAdminDashboard />
      </ServerRoleGuard>
      <ServerRoleGuard roles={['ADMIN']} user={user}>
        <AdminDashboard />
      </ServerRoleGuard>
      <ServerRoleGuard roles={['AGENT']} user={user}>
        <AgentDashboard />
      </ServerRoleGuard>
    </>
  );
}
