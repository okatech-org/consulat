import { api } from '@/trpc/server';
import { CurrentRequestCard } from './_components/current-request-card';
import { QuickActions } from './_components/quick-actions';
import { RecentHistory } from './_components/recent-history';
import { EmptyState } from './_components/empty-state';
import { UserOverview } from './_components/user-overview';
import { Button } from '@/components/ui/button';
import { Plus, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { getTranslations } from 'next-intl/server';
import type { FullServiceRequest } from '@/types/service-request';

interface SerializableRequest {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  service: { name: string };
  assignedTo?: { name: string };
}

interface Stats {
  inProgress: number;
  completed: number;
  pending: number;
  appointments: number;
}

function calculateStats(requests: FullServiceRequest[]): Stats {
  if (!requests) return { inProgress: 0, completed: 0, pending: 0, appointments: 0 };

  return {
    inProgress: requests.filter((req) =>
      ['SUBMITTED', 'VALIDATED', 'PROCESSING'].includes(req.status),
    ).length,
    completed: requests.filter((req) => req.status === 'COMPLETED').length,
    pending: requests.filter((req) => req.status === 'DRAFT').length,
    appointments: 2, // Mock data - à remplacer par un vrai calcul
  };
}

function getCurrentRequest(requests: FullServiceRequest[]): FullServiceRequest | null {
  if (!requests) return null;

  const activeRequests = requests.filter((req) =>
    ['SUBMITTED', 'VALIDATED', 'PROCESSING'].includes(req.status),
  );

  return (
    activeRequests.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )[0] || null
  );
}

function serializeRequest(request: FullServiceRequest): SerializableRequest {
  return {
    id: request.id,
    status: request.status,
    createdAt:
      request.createdAt instanceof Date
        ? request.createdAt.toISOString()
        : request.createdAt,
    updatedAt:
      request.updatedAt instanceof Date
        ? request.updatedAt.toISOString()
        : request.updatedAt,
    service: { name: request.service.name },
    assignedTo: request.assignedTo
      ? { name: request.assignedTo.name || 'Non assigné' }
      : undefined,
  };
}

function serializeRecentHistory(requests: FullServiceRequest[]) {
  return requests.slice(0, 3).map((request) => ({
    id: request.id,
    status: request.status,
    createdAt:
      request.createdAt instanceof Date ? request.createdAt : new Date(request.createdAt),
    service: { name: request.service.name },
  }));
}

export default async function MySpacePage() {
  let requests: FullServiceRequest[] = [];
  let error: string | null = null;

  try {
    // Utilisation simple de l'api tRPC côté serveur
    requests = await api.services.getUserRequests();
  } catch (err) {
    console.error('Error fetching requests:', err);
    error = 'Erreur lors du chargement des données';
  }

  const t = await getTranslations('dashboard.unified');

  // Récupérer le profil utilisateur et les statistiques parallèlement
  const [profile, documentsCount, childrenCount, upcomingAppointmentsCount] =
    await Promise.all([
      api.profile.getDashboard().catch(() => null),
      api.user.getDocumentsCount().catch(() => 0),
      api.user.getChildrenCount().catch(() => 0),
      api.user.getUpcomingAppointmentsCount().catch(() => 0),
    ]);

  // Calculer les statistiques utilisateur
  const stats = calculateStats(requests);

  // Demande en cours la plus récente
  const currentRequest = getCurrentRequest(requests);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{t('error')}</p>
        <form action={ROUTES.user.base}>
          <Button variant="outline" type="submit">
            {t('retry')}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header style SaaS non-centré */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-left">{t('title')}</h1>
          <p className="text-muted-foreground text-left">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.user.contact}>
              <HelpCircle className="size-icon" />
              {t('help')}
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href={ROUTES.user.services}>
              <Plus className="size-icon" />
              {t('new_request')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Section profil utilisateur v15 */}
      <UserOverview
        stats={{
          ...stats,
          appointments: upcomingAppointmentsCount,
        }}
        profile={profile}
        documentsCount={documentsCount}
        childrenCount={childrenCount}
      />

      {/* Demande en cours ou état vide */}
      {currentRequest ? (
        <CurrentRequestCard request={serializeRequest(currentRequest)} />
      ) : (
        <EmptyState />
      )}

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <QuickActions />
        </div>
        <div className="space-y-6">
          <RecentHistory requests={serializeRecentHistory(requests)} />
        </div>
      </div>
    </div>
  );
}
