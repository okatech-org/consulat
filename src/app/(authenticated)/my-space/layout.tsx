import { getCurrentUser } from '@/actions/user';
import { RouteAuthGuard } from '@/components/layouts/route-auth-guard';
import { hasAnyRole } from '@/lib/permissions/utils';
import { ROUTES } from '@/schemas/routes';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  const isAdmin = user && hasAnyRole(user, ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'AGENT']);

  return (
    <RouteAuthGuard
      user={user}
      roles={['USER']}
      fallbackUrl={isAdmin ? ROUTES.dashboard.base : undefined}
    >
      {children}
    </RouteAuthGuard>
  );
}
