import { getCurrentUser } from '@/actions/user';
import { RouteAuthGuard } from '@/components/layouts/route-auth-guard';
import { hasRole } from '@/lib/permissions/utils';
import { ROUTES } from '@/schemas/routes';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  const isUser = user && hasRole(user, 'USER');

  return (
    <RouteAuthGuard
      user={user}
      roles={['ADMIN', 'AGENT', 'MANAGER', 'SUPER_ADMIN']}
      fallbackUrl={isUser ? ROUTES.user.base : undefined}
    >
      <div className="flex flex-col gap-4">{children}</div>
    </RouteAuthGuard>
  );
}
