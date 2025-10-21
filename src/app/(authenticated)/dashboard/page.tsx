'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import SuperAdminDashboard from '../../../components/dashboards/superadmin-dashboard';
import { UserRole } from '@/convex/lib/constants';
import AdminDashboard from '@/components/dashboards/admin-dashboard';
import ManagerDashboard from '@/components/dashboards/manager-dashboard';
import AgentDashboard from '@/components/dashboards/agent-dashboard';

export default function DashboardPage() {
  const { user } = useCurrentUser();

  if (user?.roles.includes(UserRole.SuperAdmin)) {
    return <SuperAdminDashboard />;
  }

  if (user?.roles.includes(UserRole.Admin)) {
    return <AdminDashboard />;
  }

  if (user?.roles.includes(UserRole.Manager)) {
    return <ManagerDashboard />;
  }

  if (user?.roles.includes(UserRole.Agent)) {
    return <AgentDashboard />;
  }

  return <div>Dashboard</div>;
}
