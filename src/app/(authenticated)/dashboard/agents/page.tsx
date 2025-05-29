import { getCurrentUser } from '@/actions/user';
import { RouteAuthGuard } from '@/components/layouts/route-auth-guard';
import { ROUTES } from '@/schemas/routes';

export default async function AgentsPage() {
  const user = await getCurrentUser();

  return (
    <RouteAuthGuard
      user={user ?? undefined}
      roles={['ADMIN', 'MANAGER']}
      fallbackUrl={ROUTES.dashboard.base}
    >
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Gestion des agents</h1>
        {/* TODO: Table de listing des agents ici */}
        <div className="text-muted-foreground">(Listing des agents à venir)</div>
      </div>
    </RouteAuthGuard>
  );
}
