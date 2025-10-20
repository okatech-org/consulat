'use client';

import SuperAdminDashboard from '../../../components/dashboards/superadmin-dashboard';
import AgentDashboard from '../../../components/dashboards/agent-dashboard';
import AdminDashboard from '../../../components/dashboards/admin-dashboard';
import { ManagerDashboard } from '../../../components/dashboards/manager-dashboard';
import { ROUTES } from '@/schemas/routes';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/convex/lib/constants';
import { useCurrentUser } from '@/hooks/use-current-user';

export default function DashboardPage() {
  const { user } = useCurrentUser();
  const router = useRouter();

  const firstRole = user?.roles?.[0];

  if (firstRole === UserRole.IntelAgent) {
    router.push(ROUTES.intel.base);
  }

  if (firstRole === UserRole.User) {
    router.push(ROUTES.user.base);
  }

  switch (firstRole) {
    case UserRole.SuperAdmin:
      return <SuperAdminDashboard />;
    case UserRole.Admin:
      return <AdminDashboard />;
    case UserRole.Manager:
      return <ManagerDashboard />;
    case UserRole.Agent:
      return <AgentDashboard />;
    default:
      return <div>Vous n&apos;êtes pas autorisé à accéder à cette page</div>;
  }
}
