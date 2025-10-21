'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import SuperAdminDashboard from '../../../components/dashboards/superadmin-dashboard';
import { UserRole } from '@/convex/lib/constants';

export default function DashboardPage() {
  const { user } = useCurrentUser();

  if (user?.roles.includes(UserRole.SuperAdmin)) {
    return <SuperAdminDashboard />;
  }

  return <div>Dashboard</div>;
}
