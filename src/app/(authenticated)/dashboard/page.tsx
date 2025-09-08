import { ServerRoleGuard } from '@/lib/permissions/utils';
import SuperAdminDashboard from '../../../components/dashboards/superadmin-dashboard';
import { getCurrentUser } from '@/actions/user';
import AgentDashboard from '../../../components/dashboards/agent-dashboard';
import AdminDashboard from '../../../components/dashboards/admin-dashboard';
import { ManagerDashboard } from '../../../components/dashboards/manager-dashboard';
import IntelAgentDashboard from '../../../components/dashboards/intel-agent-dashboard';
import type { SessionUser } from '@/types/user';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Pour INTEL_AGENT, retourner le dashboard full-screen sans layout
  if (user?.role === 'INTEL_AGENT') {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
        <IntelAgentDashboard />
      </div>
    );
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
