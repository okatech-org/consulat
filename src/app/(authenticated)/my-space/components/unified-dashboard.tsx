'use client';

import { useUserServiceRequests } from '@/hooks/use-services';
import { CurrentRequestCard } from './current-request-card';
import { QuickActions } from './quick-actions';
import { RecentHistory } from './recent-history';
import { EmptyState } from './empty-state';
import { UserOverview } from './user-overview';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useMemo } from 'react';

export function UnifiedDashboard() {
  const { requests, isLoading, error, refetch } = useUserServiceRequests();

  // Calculer les statistiques utilisateur
  const stats = useMemo(() => {
    if (!requests) return { inProgress: 0, completed: 0, pending: 0, appointments: 2 };

    return {
      inProgress: requests.filter((req) =>
        ['SUBMITTED', 'VALIDATED', 'PROCESSING'].includes(req.status),
      ).length,
      completed: requests.filter((req) => req.status === 'COMPLETED').length,
      pending: requests.filter((req) => req.status === 'DRAFT').length,
      appointments: 2, // Mock data - à remplacer par un vrai hook
    };
  }, [requests]);

  // Demande en cours la plus récente
  const currentRequest = useMemo(() => {
    if (!requests) return null;

    const activeRequests = requests.filter((req) =>
      ['SUBMITTED', 'VALIDATED', 'PROCESSING'].includes(req.status),
    );

    return (
      activeRequests.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )[0] || null
    );
  }, [requests]);

  if (isLoading) {
    return <UnifiedDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">Erreur lors du chargement</p>
        <Button variant="outline" onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header style SaaS non-centré */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-left">Mon Espace Consulaire</h1>
          <p className="text-muted-foreground text-left">
            Gérez vos demandes et accédez à tous vos services
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.user.feedback}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Aide
            </Link>
          </Button>
          <Button asChild>
            <Link href={ROUTES.user.service_available}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle demande
            </Link>
          </Button>
        </div>
      </div>

      {/* Section profil utilisateur v15 */}
      <UserOverview stats={stats} />

      {/* Demande en cours ou état vide */}
      {currentRequest ? (
        <CurrentRequestCard
          request={{
            ...currentRequest,
            createdAt:
              currentRequest.createdAt instanceof Date
                ? currentRequest.createdAt.toISOString()
                : currentRequest.createdAt,
            updatedAt:
              currentRequest.updatedAt instanceof Date
                ? currentRequest.updatedAt.toISOString()
                : currentRequest.updatedAt,
          }}
        />
      ) : (
        <EmptyState />
      )}

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <QuickActions />
        </div>
        <div className="space-y-6">
          <RecentHistory
            requests={
              requests?.slice(0, 3).map((request) => ({
                ...request,
                createdAt:
                  request.createdAt instanceof Date
                    ? request.createdAt.toISOString()
                    : request.createdAt,
              })) || []
            }
          />
        </div>
      </div>
    </div>
  );
}

function UnifiedDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="h-8 w-64 bg-muted rounded mb-2" />
          <div className="h-4 w-96 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-muted rounded" />
          <div className="h-9 w-24 bg-muted rounded" />
          <div className="h-9 w-32 bg-muted rounded" />
        </div>
      </div>
      <div className="h-32 w-full bg-muted rounded" />
      <div className="h-64 w-full bg-muted rounded" />
    </div>
  );
}
