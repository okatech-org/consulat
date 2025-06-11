import { getCurrentUser } from '@/actions/user';
import { RouteAuthGuard } from '@/components/layouts/route-auth-guard';
import { ROUTES } from '@/schemas/routes';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <RouteAuthGuard
      user={user}
      roles={['ADMIN', 'AGENT', 'MANAGER', 'SUPER_ADMIN']}
      fallbackUrl={ROUTES.user.base}
    >
      {children}
    </RouteAuthGuard>
  );
}
