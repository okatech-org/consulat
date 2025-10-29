'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { RequestStatus } from '@/convex/lib/constants';
import { useUserServiceRequestsDashboard } from '@/hooks/use-services';
import { type DashboardServiceRequest } from '@/server/api/routers/services/services';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Input } from '@/components/ui/input';
import CardContainer from '@/components/layouts/card-container';
import {
  Plus,
  Search,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ChevronRight,
  X,
  TrendingUp,
  Calendar,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ServicesListClientProps {
  initialData: {
    requests: DashboardServiceRequest[];
    nextCursor: string | undefined;
    totalCount: number;
    hasMore: boolean;
    stats: {
      ongoing: number;
      completed: number;
      needsAttention: number;
      total: number;
    };
  };
}

// Configuration des statuts pour l'affichage
const statusConfig: Record<
  RequestStatus,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  DRAFT: {
    label: 'Brouillon',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50 hover:bg-muted/70 border-muted',
    icon: <FileText className="h-3 w-3" />,
  },
  SUBMITTED: {
    label: 'Soumise',
    color: 'text-primary',
    bgColor: 'bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary',
    icon: <FileText className="h-3 w-3" />,
  },
  EDITED: {
    label: 'Modifiée',
    color: 'text-secondary-foreground',
    bgColor:
      'bg-secondary/50 hover:bg-secondary/70 border-secondary text-secondary-foreground',
    icon: <FileText className="h-3 w-3" />,
  },
  PENDING: {
    label: 'En traitement',
    color: 'text-warning',
    bgColor: 'bg-warning/10 hover:bg-warning/20 border-warning/20 text-warning',
    icon: <Clock className="h-3 w-3" />,
  },
  PENDING_COMPLETION: {
    label: "En attente d'information",
    color: 'text-warning',
    bgColor: 'bg-warning/10 hover:bg-warning/20 border-warning/20 text-warning',
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  VALIDATED: {
    label: 'Validée',
    color: 'text-success',
    bgColor: 'bg-success/10 hover:bg-success/20 border-success/20 text-success',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  REJECTED: {
    label: 'Rejetée',
    color: 'text-destructive',
    bgColor:
      'bg-destructive/10 hover:bg-destructive/20 border-destructive/20 text-destructive',
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  CARD_IN_PRODUCTION: {
    label: 'En production',
    color: 'text-primary',
    bgColor: 'bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary',
    icon: <Clock className="h-3 w-3" />,
  },
  DOCUMENT_IN_PRODUCTION: {
    label: 'Document en production',
    color: 'text-primary',
    bgColor: 'bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary',
    icon: <Clock className="h-3 w-3" />,
  },
  READY_FOR_PICKUP: {
    label: 'Prête au retrait',
    color: 'text-success',
    bgColor: 'bg-success/10 hover:bg-success/20 border-success/20 text-success',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  APPOINTMENT_SCHEDULED: {
    label: 'RDV programmé',
    color: 'text-primary',
    bgColor: 'bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary',
    icon: <Calendar className="h-3 w-3" />,
  },
  COMPLETED: {
    label: 'Terminée',
    color: 'text-success',
    bgColor: 'bg-success/10 hover:bg-success/20 border-success/20 text-success',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
};

// Calculer le pourcentage de progression basé sur le statut
const getProgressPercentage = (status: RequestStatus): number => {
  const statusOrder = [
    'DRAFT',
    'SUBMITTED',
    'EDITED',
    'PENDING',
    'PENDING_COMPLETION',
    'VALIDATED',
    'CARD_IN_PRODUCTION',
    'READY_FOR_PICKUP',
    'APPOINTMENT_SCHEDULED',
    'COMPLETED',
    'REJECTED',
  ];

  if (status === 'REJECTED') return 100;

  const index = statusOrder.indexOf(status);
  const maxIndex = statusOrder.length - 2; // Exclure REJECTED

  return Math.round((index / maxIndex) * 100);
};

export function ServicesListClient({ initialData }: ServicesListClientProps) {
  const t = useTranslations('services');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'ongoing' | 'completed' | 'archived'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Construire les filtres de statut selon le filtre actif
  const getStatusFilter = () => {
    if (activeFilter === 'ongoing') {
      return [
        'DRAFT',
        'SUBMITTED',
        'EDITED',
        'PENDING',
        'PENDING_COMPLETION',
        'VALIDATED',
        'CARD_IN_PRODUCTION',
      ] as RequestStatus[];
    } else if (activeFilter === 'completed') {
      return ['COMPLETED', 'READY_FOR_PICKUP'] as RequestStatus[];
    } else if (activeFilter === 'archived') {
      return ['REJECTED'] as RequestStatus[];
    }
    return undefined;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useUserServiceRequestsDashboard({
      limit: 20,
      status: getStatusFilter(),
      search: searchQuery.trim() || undefined,
    });

  // Utiliser les données initiales ou les données de la query
  const requests = useMemo(() => {
    if (data?.pages) {
      return data.pages.flatMap((page) => page.requests);
    }
    return initialData.requests;
  }, [data?.pages, initialData.requests]);

  const stats = data?.pages?.[0]?.stats ?? initialData.stats;
  const totalCount = data?.pages?.[0]?.totalCount ?? initialData.totalCount;

  const resetFilters = () => {
    setActiveFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = activeFilter !== 'all' || searchQuery.trim() !== '';

  if (isLoading) {
    return <LoadingSkeleton variant="grid" />;
  }

  return (
    <Tabs defaultValue="dashboard" className="w-full">
      <TabsList className="w-full sm:w-auto bg-card border shadow-sm h-9">
        <TabsTrigger
          value="dashboard"
          className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm h-7"
        >
          Tableau de bord
        </TabsTrigger>
        <TabsTrigger
          value="my-requests"
          className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm h-7"
        >
          Mes demandes
          {totalCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 px-1.5 py-0 text-xs bg-muted text-muted-foreground h-4"
            >
              {totalCount}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="mt-6 space-y-6">
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold text-warning">{stats.ongoing}</p>
              </div>
              <div className="p-2 bg-warning/10 rounded-full">
                <Clock className="h-4 w-4 text-warning" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Terminées</p>
                <p className="text-2xl font-bold text-success">{stats.completed}</p>
              </div>
              <div className="p-2 bg-success/10 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attention</p>
                <p className="text-2xl font-bold text-destructive">
                  {stats.needsAttention}
                </p>
              </div>
              <div className="p-2 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
            </div>
          </div>
        </div>

        {/* Demandes récentes */}
        <CardContainer
          title="Demandes récentes"
          subtitle="Vos 5 dernières demandes de services consulaires"
          action={
            requests.length > 5 ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  const element = document.querySelector('[data-value="my-requests"]');
                  if (element instanceof HTMLElement) {
                    element.click();
                  }
                }}
              >
                Voir tout
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            ) : null
          }
        >
          {requests.length > 0 ? (
            <div className="space-y-3">
              {requests.slice(0, 5).map((request) => {
                const status = request.status as RequestStatus;
                const statusInfo = statusConfig[status];
                const progress = getProgressPercentage(status);

                return (
                  <Link
                    href={ROUTES.user.service_request_details(request.id)}
                    key={request.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 last:border-b-0 hover:bg-muted/30 rounded-lg p-2 -m-2 transition-colors group"
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {request.service.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {request.updatedAt
                          ? formatDistanceToNow(new Date(request.updatedAt), {
                              addSuffix: true,
                              locale: fr,
                            })
                          : formatDistanceToNow(new Date(request.createdAt), {
                              addSuffix: true,
                              locale: fr,
                            })}
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end mt-2 sm:mt-0 space-y-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${statusInfo.bgColor} border`}
                      >
                        {statusInfo.icon}
                        <span className="ml-1">{statusInfo.label}</span>
                      </Badge>
                      {status !== 'REJECTED' && (
                        <div className="w-full sm:w-20">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
              <div className="max-w-sm mx-auto space-y-3">
                <div className="p-3 bg-card rounded-full w-fit mx-auto border border-muted">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Aucune demande</h3>
                  <p className="text-sm text-muted-foreground">{t('myRequests.empty')}</p>
                </div>
                <Link href={ROUTES.user.services + '/available'}>
                  <Button size="sm" className="mt-2">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('myRequests.startNew')}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContainer>

        {/* Cartes d'action */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardContainer
            title="Nouvelle demande"
            subtitle="Démarrez une nouvelle demande de service consulaire"
            footerContent={
              <Link href={ROUTES.user.services + '/available'} className="w-full">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Découvrir les services
                </Button>
              </Link>
            }
          >
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Accédez à tous les services disponibles proposés par votre consulat.
              </p>
              <div className="flex items-center gap-2 text-xs text-primary">
                <TrendingUp className="h-3 w-3" />
                <span>Services optimisés et rapides</span>
              </div>
            </div>
          </CardContainer>

          <CardContainer
            title="Besoin d'aide ?"
            subtitle="Assistance pour vos demandes"
            footerContent={
              <Button variant="outline" className="w-full" onClick={() => {}}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Obtenir de l&apos;aide
              </Button>
            }
          >
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Si vous avez des questions sur vos demandes ou les services disponibles,
                contactez-nous.
              </p>
              <div className="flex items-center gap-2 text-xs text-success">
                <CheckCircle2 className="h-3 w-3" />
                <span>Support disponible 24/7</span>
              </div>
            </div>
          </CardContainer>
        </div>
      </TabsContent>

      <TabsContent value="my-requests" className="mt-6 space-y-4">
        {/* Recherche et filtres compacts */}
        <div className="bg-card rounded-lg border p-4 shadow-sm space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une demande par nom ou ID..."
              className="pl-10 pr-4 py-2 text-sm focus:border-primary transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery('')}
                aria-label="Effacer la recherche"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Boutons de filtre */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground mr-2">Filtrer :</span>
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('all')}
              className="h-8 text-xs"
            >
              Toutes
              <Badge
                variant="secondary"
                className="ml-1 px-1 py-0 text-xs bg-muted text-muted-foreground h-4"
              >
                {stats.total}
              </Badge>
            </Button>
            <Button
              variant={activeFilter === 'ongoing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('ongoing')}
              className="h-8 text-xs"
            >
              En cours
              <Badge
                variant="secondary"
                className="ml-1 px-1 py-0 text-xs bg-warning/10 text-warning h-4"
              >
                {stats.ongoing}
              </Badge>
            </Button>
            <Button
              variant={activeFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('completed')}
              className="h-8 text-xs"
            >
              Terminées
              <Badge
                variant="secondary"
                className="ml-1 px-1 py-0 text-xs bg-success/10 text-success h-4"
              >
                {stats.completed}
              </Badge>
            </Button>
            <Button
              variant={activeFilter === 'archived' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('archived')}
              className="h-8 text-xs"
            >
              Archivées
            </Button>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="ml-auto h-8 text-xs hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive"
              >
                <X className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Liste des demandes */}
        {requests.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 bg-card rounded-full w-fit mx-auto border border-muted">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {searchQuery || activeFilter !== 'all'
                    ? 'Aucune demande trouvée'
                    : 'Aucune demande'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery || activeFilter !== 'all'
                    ? 'Aucune demande ne correspond à vos critères. Essayez de modifier vos filtres.'
                    : t('myRequests.empty')}
                </p>
              </div>
              {searchQuery || activeFilter !== 'all' ? (
                <Button onClick={resetFilters} className="bg-primary hover:bg-primary/90">
                  <X className="mr-2 h-4 w-4" />
                  Réinitialiser les filtres
                </Button>
              ) : (
                <Link href={ROUTES.user.services + '/available'}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('myRequests.startNew')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((request) => {
              const status = request.status as RequestStatus;
              const statusInfo = statusConfig[status];
              const progress = getProgressPercentage(status);

              return (
                <div
                  key={request.id}
                  className="bg-card border-2 rounded-lg p-4 space-y-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {request.service.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Soumise le{' '}
                        {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${statusInfo.bgColor} border flex-shrink-0`}
                    >
                      {statusInfo.icon}
                      <span className="ml-1">{statusInfo.label}</span>
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Dernière mise à jour:{' '}
                      {request.updatedAt
                        ? formatDistanceToNow(new Date(request.updatedAt), {
                            addSuffix: true,
                            locale: fr,
                          })
                        : formatDistanceToNow(new Date(request.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                    </p>

                    {status !== 'REJECTED' && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progression</span>
                          <span className="font-medium text-foreground">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:border-primary/50 transition-colors"
                    asChild
                  >
                    <Link href={ROUTES.user.service_request_details(request.id)}>
                      <ChevronRight className="h-3 w-3 mr-2" />
                      {t('actions.viewDetails')}
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Bouton charger plus */}
        {hasNextPage && (
          <div className="flex justify-center">
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              variant="outline"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : (
                'Charger plus'
              )}
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
