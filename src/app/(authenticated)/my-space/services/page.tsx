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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getUserServiceRequests } from '@/actions/services';
import { RequestStatus } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { FullServiceRequest } from '@/types/service-request';
import { ROUTES } from '@/schemas/routes';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageContainer } from '@/components/layouts/page-container';
import { ChatToggle } from '@/components/chat/chat-toggle';

// Status config for display
const statusConfig: Record<
  RequestStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  DRAFT: {
    label: 'Brouillon',
    color: 'bg-slate-400 hover:bg-slate-500',
    icon: <FileText className="h-4 w-4" />,
  },
  SUBMITTED: {
    label: 'Soumise',
    color: 'bg-blue-400 hover:bg-blue-500',
    icon: <FileText className="h-4 w-4" />,
  },
  EDITED: {
    label: 'Modifiée',
    color: 'bg-gray-400 hover:bg-gray-500',
    icon: <FileText className="h-4 w-4" />,
  },
  PENDING: {
    label: 'En traitement',
    color: 'bg-amber-400 hover:bg-amber-500',
    icon: <Clock className="h-4 w-4" />,
  },
  PENDING_COMPLETION: {
    label: "En attente d'information",
    color: 'bg-purple-400 hover:bg-purple-500',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  VALIDATED: {
    label: 'Validée',
    color: 'bg-green-400 hover:bg-green-500',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  REJECTED: {
    label: 'Rejetée',
    color: 'bg-red-400 hover:bg-red-500',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  CARD_IN_PRODUCTION: {
    label: 'En production',
    color: 'bg-cyan-400 hover:bg-cyan-500',
    icon: <Clock className="h-4 w-4" />,
  },
  READY_FOR_PICKUP: {
    label: 'Prête au retrait',
    color: 'bg-emerald-400 hover:bg-emerald-500',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  APPOINTMENT_SCHEDULED: {
    label: 'RDV programmé',
    color: 'bg-violet-400 hover:bg-violet-500',
    icon: <Clock className="h-4 w-4" />,
  },
  COMPLETED: {
    label: 'Terminée',
    color: 'bg-green-600 hover:bg-green-700',
    icon: <CheckCircle2 className="h-4 w-4" />,
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

  // Summary statistics for the dashboard
  const getRequestStats = () => {
    return {
      total: serviceRequests.length,
      ongoing: serviceRequests.filter((req) =>
        [
          'DRAFT',
          'SUBMITTED',
          'EDITED',
          'PENDING',
          'PENDING_COMPLETION',
          'VALIDATED',
          'CARD_IN_PRODUCTION',
        ].includes(req.status),
      ).length,
      completed: serviceRequests.filter((req) =>
        ['COMPLETED', 'READY_FOR_PICKUP'].includes(req.status),
      ).length,
      rejected: serviceRequests.filter((req) => req.status === 'REJECTED').length,
    };
  };

  const stats = getRequestStats();

  return (
    <PageContainer
      title={t('title')}
      description={t('description')}
      action={
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="size-icon" />
            <span className="hidden md:inline">{t('actions.refresh')}</span>
          </Button>
          <Link href={ROUTES.user.service_available}>
            <Button size="sm">
              <Plus className="size-icon" />
              <span className="hidden md:inline">{t('myRequests.startNew')}</span>
            </Button>
          </Link>
        </div>
      }
    >
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full md:w-[500px] grid-cols-2">
          <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
          <TabsTrigger data-value="my-requests" value="my-requests">
            Mes demandes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6 space-y-6">
          {/* Recent Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Demandes récentes</CardTitle>
              <CardDescription>
                Vos 5 dernières demandes de services consulaires
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : serviceRequests.length > 0 ? (
                <div className="space-y-4">
                  {serviceRequests.slice(0, 5).map((request) => {
                    const status = request.status as RequestStatus;
                    const statusInfo = statusConfig[status];
                    const progress = getProgressPercentage(status);

                    return (
                      <Link
                        href={ROUTES.user.service_request_details(request.id)}
                        key={request.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 hover:bg-muted/30 rounded-lg p-2 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="font-medium">{request.service?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(request.updatedAt), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end mt-2 sm:mt-0 space-y-2">
                          <Badge
                            className={`${statusInfo.color} flex items-center gap-1`}
                          >
                            {statusInfo.icon}
                            {statusInfo.label}
                          </Badge>
                          {status !== 'REJECTED' && (
                            <div className="w-full sm:w-24">
                              <Progress value={progress} className="h-2" />
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">{t('myRequests.empty')}</p>
                  <Link href={ROUTES.user.services + '/available'}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      {t('myRequests.startNew')}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
            {serviceRequests.length > 5 && (
              <CardFooter>
                <Link href="#my-requests">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      const element = document.querySelector(
                        '[data-value="my-requests"]',
                      );
                      if (element instanceof HTMLElement) {
                        element.click();
                      }
                    }}
                  >
                    Voir toutes mes demandes
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            )}
          </Card>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total des demandes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">En cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-500">{stats.ongoing}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Complétées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{stats.completed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Rejetées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">{stats.rejected}</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/30 shadow-sm">
              <CardHeader>
                <CardTitle>Nouvelle demande</CardTitle>
                <CardDescription>
                  Démarrez une nouvelle demande de service consulaire
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Accédez à tous les services disponibles proposés par votre consulat.
                </p>
              </CardContent>
              <CardFooter>
                <Link href={ROUTES.user.services + '/available'}>
                  <Button className="w-full">
                    <Plus className="size-icon" />
                    Découvrir les services
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/30 shadow-sm">
              <CardHeader>
                <CardTitle>Besoin d'aide ?</CardTitle>
                <CardDescription>Assistance pour vos demandes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Si vous avez des questions sur vos demandes ou les services disponibles,
                  contactez-nous.
                </p>
              </CardContent>
              <CardFooter>
                <Link href={'#'}>
                  <Button variant="outline" className="w-full">
                    Obtenir de l&apos;aide
                  </Button>
                  <ChatToggle />
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="my-requests" className="mt-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
            {/* Search and filter controls */}
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Rechercher une demande..."
                className="pl-8 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('all')}
              >
                Toutes
              </Button>
              <Button
                variant={activeFilter === 'ongoing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('ongoing')}
              >
                En cours
              </Button>
              <Button
                variant={activeFilter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('completed')}
              >
                Complétées
              </Button>
              <Button
                variant={activeFilter === 'archived' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('archived')}
              >
                Archivées
              </Button>
            </div>
          </div>

          {/* Requests listing */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-40 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Skeleton className="h-2 w-24" />
                    <Skeleton className="h-9 w-32" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRequests.map((request) => {
                const status = request.status as RequestStatus;
                const statusInfo = statusConfig[status];
                const progress = getProgressPercentage(status);

                return (
                  <Link
                    href={ROUTES.user.service_request_details(request.id)}
                    key={request.id}
                    className="block transition-transform hover:scale-[1.01]"
                  >
                    <Card className="h-full flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {request.service?.name}
                          </CardTitle>
                          <Badge
                            className={`${statusInfo.color} flex items-center gap-1`}
                          >
                            {statusInfo.icon}
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <CardDescription>
                          Soumise le {new Date(request.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2 flex-grow">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Dernière mise à jour:{' '}
                            {formatDistanceToNow(new Date(request.updatedAt), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </p>
                          {request.assignedTo && (
                            <p className="text-sm">
                              Assignée à: {request.assignedTo.name}
                            </p>
                          )}

                          {status !== 'REJECTED' && (
                            <div className="pt-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progression</span>
                                <span>{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <Button variant="outline" size="sm" className="w-full">
                          {t('actions.viewDetails')}
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-background">
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? 'Aucune demande ne correspond à votre recherche'
                  : t('myRequests.empty')}
              </p>
              {!searchQuery && (
                <Link href={ROUTES.user.services + '/available'}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('myRequests.startNew')}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
