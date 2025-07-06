'use client';

import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ChevronRight,
  X,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getUserServiceRequests } from '@/actions/services';
import { RequestStatus } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import type { FullServiceRequest } from '@/types/service-request';
import { ROUTES } from '@/schemas/routes';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageContainer } from '@/components/layouts/page-container';
import { useChat } from '@/contexts/chat-context';
import CardContainer from '@/components/layouts/card-container';
import { Input } from '@/components/ui/input';

// Status config for display with improved colors using project's palette
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

// Get progression percentage based on status
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
    'REJECTED', // Special case, handled separately
  ];

  if (status === 'REJECTED') return 100; // Special case for rejected

  const index = statusOrder.indexOf(status);
  const maxIndex = statusOrder.length - 2; // Exclude REJECTED

  return Math.round((index / maxIndex) * 100);
};

export default function ServicesPage() {
  const { toggleChat } = useChat();
  const t = useTranslations('services');
  const [serviceRequests, setServiceRequests] = useState<FullServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'ongoing' | 'completed' | 'archived'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const requests = await getUserServiceRequests();
        setServiceRequests(requests || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter requests based on status and search query
  const filterRequests = () => {
    let filtered = [...serviceRequests];

    // Filter by status
    if (activeFilter === 'ongoing') {
      filtered = filtered.filter((req) =>
        [
          'DRAFT',
          'SUBMITTED',
          'EDITED',
          'PENDING',
          'PENDING_COMPLETION',
          'VALIDATED',
          'CARD_IN_PRODUCTION',
        ].includes(req.status),
      );
    } else if (activeFilter === 'completed') {
      filtered = filtered.filter((req) =>
        ['COMPLETED', 'READY_FOR_PICKUP'].includes(req.status),
      );
    } else if (activeFilter === 'archived') {
      filtered = filtered.filter((req) => ['REJECTED'].includes(req.status));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.service?.name.toLowerCase().includes(query) ||
          req.id.toLowerCase().includes(query),
      );
    }

    return filtered;
  };

  const filteredRequests = filterRequests();

  // Get statistics for dashboard
  const getStatistics = () => {
    const total = serviceRequests.length;
    const ongoing = serviceRequests.filter((req) =>
      [
        'DRAFT',
        'SUBMITTED',
        'EDITED',
        'PENDING',
        'PENDING_COMPLETION',
        'VALIDATED',
        'CARD_IN_PRODUCTION',
      ].includes(req.status),
    ).length;
    const completed = serviceRequests.filter((req) =>
      ['COMPLETED', 'READY_FOR_PICKUP'].includes(req.status),
    ).length;
    const needsAttention = serviceRequests.filter((req) =>
      ['PENDING_COMPLETION', 'READY_FOR_PICKUP'].includes(req.status),
    ).length;

    return { total, ongoing, completed, needsAttention };
  };

  const stats = getStatistics();

  const resetFilters = () => {
    setActiveFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = activeFilter !== 'all' || searchQuery.trim() !== '';

  return (
    <PageContainer
      title={t('title')}
      description={t('description')}
      action={
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="h-8"
            aria-label="Actualiser"
          >
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t('actions.refresh')}</span>
          </Button>
          <Link href={ROUTES.user.service_available}>
            <Button size="sm" className="h-8">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('myRequests.startNew')}</span>
            </Button>
          </Link>
        </div>
      }
    >
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
            {!loading && serviceRequests.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 px-1.5 py-0 text-xs bg-muted text-muted-foreground h-4"
              >
                {serviceRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6 space-y-6">
          {/* Statistics Cards */}
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

          {/* Recent Requests */}
          <CardContainer
            title="Demandes récentes"
            subtitle="Vos 5 dernières demandes de services consulaires"
            action={
              serviceRequests.length > 5 ? (
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
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-3 last:border-b-0"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : serviceRequests.length > 0 ? (
              <div className="space-y-3">
                {serviceRequests.slice(0, 5).map((request) => {
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
                          {request.service?.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(request.updatedAt), {
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
                    <p className="text-sm text-muted-foreground">
                      {t('myRequests.empty')}
                    </p>
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

          {/* Action Cards */}
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
                <Button variant="outline" className="w-full" onClick={toggleChat}>
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
          {/* Compact search and filters */}
          <div className="bg-card rounded-lg border p-4 shadow-sm space-y-4">
            {/* Search bar */}
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

            {/* Filter buttons */}
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
                  {serviceRequests.length}
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

            {/* Active filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-1 pt-2 border-t">
                {activeFilter !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="text-xs py-0 px-2 h-6 bg-primary/10 text-primary border-primary/20"
                  >
                    <span>Filtre: {activeFilter}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-3 w-3 ml-1 p-0 hover:bg-primary/30 rounded-full"
                      onClick={() => setActiveFilter('all')}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )}
                {searchQuery.trim() && (
                  <Badge
                    variant="secondary"
                    className="text-xs py-0 px-2 h-6 bg-accent text-accent-foreground border-accent"
                  >
                    <span className="truncate max-w-[80px]">"{searchQuery}"</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-3 w-3 ml-1 p-0 hover:bg-accent/60 rounded-full"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Results summary */}
          {!loading && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">
                  {filteredRequests.length} demande
                  {filteredRequests.length > 1 ? 's' : ''} trouvée
                  {filteredRequests.length > 1 ? 's' : ''}
                </span>
                {filteredRequests.length !== serviceRequests.length && (
                  <>
                    <span className="text-muted-foreground">sur</span>
                    <span className="text-muted-foreground">
                      {serviceRequests.length}
                    </span>
                  </>
                )}
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="h-7 text-xs text-primary border-primary/20 hover:bg-primary/10"
                >
                  Voir toutes
                </Button>
              )}
            </div>
          )}

          {/* Requests listing */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRequests.map((request) => {
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
                          {request.service?.name}
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
                        {formatDistanceToNow(new Date(request.updatedAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                      {request.assignedTo && (
                        <p className="text-xs text-muted-foreground">
                          Assignée à:{' '}
                          <span className="font-medium">{request.assignedTo.name}</span>
                        </p>
                      )}

                      {status !== 'REJECTED' && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progression</span>
                            <span className="font-medium text-foreground">
                              {progress}%
                            </span>
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
          ) : (
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
                  <Button
                    onClick={resetFilters}
                    className="bg-primary hover:bg-primary/90"
                  >
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
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
