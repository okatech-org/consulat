import { getCurrentUser } from '@/lib/auth/utils';
import { RouteAuthGuard } from '@/components/layouts/route-auth-guard';
import { ROUTES } from '@/schemas/routes';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <RouteAuthGuard user={user} roles={['USER']} fallbackUrl={ROUTES.dashboard.base}>
      {children}
    </RouteAuthGuard>
  );
}
