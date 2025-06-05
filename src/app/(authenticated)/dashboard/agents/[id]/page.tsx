'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAgentDetails, AgentDetails } from '@/actions/agents';
import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';
import { StatsCard } from '@/components/ui/stats-card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/data-table';
import { FilterOption } from '@/components/data-table/data-table-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { useTableSearchParams } from '@/components/utils/table-hooks';
import { tryCatch, useDateLocale } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Mail,
  Phone,
  Globe,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  Briefcase,
  Settings,
  AlertCircle,
  ExternalLink,
  Eye,
  Users,
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ColumnDef } from '@tanstack/react-table';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { RequestStatus, ServiceCategory, ServicePriority, UserRole } from '@prisma/client';
import { EditAgentForm } from './components/edit-agent-form';

interface RequestFilters {
  search?: string;
  status?: string[];
  serviceCategory?: string[];
  priority?: string[];
  page?: number;
  limit?: number;
}

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const t = useTranslations();
  const { formatDate } = useDateLocale();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<AgentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredRequests, setFilteredRequests] = useState<
    AgentDetails['assignedRequests']
  >([]);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Table state management
  const {
    params: tableParams,
    pagination,
    sorting,
    handleParamsChange,
    handleSortingChange,
    handlePaginationChange,
  } = useTableSearchParams<AgentDetails['assignedRequests'][0], RequestFilters>(
    adaptSearchParams,
  );

  function adaptSearchParams(urlSearchParams: URLSearchParams): RequestFilters {
    const params: RequestFilters = {};
    const paramsKeys: (keyof RequestFilters)[] = [
      'search',
      'status',
      'serviceCategory',
      'priority',
    ];

    paramsKeys.forEach((key) => {
      const value = urlSearchParams.get(key);
      if (value) {
        if (key === 'status' || key === 'serviceCategory' || key === 'priority') {
          const arr = value.split(',');
          if (arr.length > 0 && arr[0] !== '') {
            params[key] = arr as any;
          }
        } else {
          params[key] = value as any;
        }
      }
    });

    return params;
  }

  // Définition des statuses pour les filtres
  const statuses = useMemo(
    () =>
      Object.values(RequestStatus).map((status) => ({
        value: status,
        label: t(`inputs.requestStatus.options.${status}`),
      })),
    [t],
  );

  // Définition des filtres pour le tableau des demandes
  const requestFilters = useMemo<FilterOption<AgentDetails['assignedRequests'][0]>[]>(
    () => [
      {
        type: 'search',
        property: 'search',
        label: t('requests.filters.search'),
        defaultValue: tableParams.search || '',
        onChange: (value: string) => handleParamsChange('search', value),
      },
      {
        type: 'checkbox',
        property: 'status',
        label: t('inputs.status.label'),
        defaultValue: (tableParams.status as string[]) || [],
        options: statuses,
        onChange: (value: string[]) => handleParamsChange('status', value),
      },
      {
        type: 'checkbox',
        property: 'serviceCategory',
        label: t('requests.filters.service_category'),
        defaultValue: (tableParams.serviceCategory as string[]) || [],
        options: Object.values(ServiceCategory).map((category) => ({
          value: category,
          label: t(`inputs.serviceCategory.options.${category}`),
        })),
        onChange: (value: string[]) => handleParamsChange('serviceCategory', value),
      },
      {
        type: 'checkbox',
        property: 'priority',
        label: t('requests.filters.priority'),
        defaultValue: (tableParams.priority as string[]) || [],
        options: Object.values(ServicePriority).map((priority) => ({
          value: priority,
          label: t(`common.priority.${priority}`),
        })),
        onChange: (value: string[]) => handleParamsChange('priority', value),
      },
    ],
    [t, tableParams, statuses, handleParamsChange],
  );

  // Définition des colonnes pour les agents managés
  const managedAgentsColumns: ColumnDef<NonNullable<AgentDetails['managedAgents']>[0]>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nom" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={undefined} alt={row.original.name || '-'} />
              <AvatarFallback>{row.original.name?.[0] || 'A'}</AvatarFallback>
            </Avatar>
            <Link
              href={ROUTES.dashboard.agent_detail(row.original.id)}
              className="font-medium hover:underline"
            >
              {row.original.name || 'Sans nom'}
            </Link>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
        cell: ({ row }) => row.original.email || '-',
      },
      {
        accessorKey: 'phoneNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Téléphone" />,
        cell: ({ row }) => row.original.phoneNumber || '-',
      },
      {
        accessorKey: 'linkedCountries',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Pays" />,
        cell: ({ row }) =>
          row.original.linkedCountries && row.original.linkedCountries.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.original.linkedCountries.map((c: any) => (
                <Badge key={c.code} variant="outline">{c.name}</Badge>
              ))}
            </div>
          ) : (
            '-'
          ),
      },
      {
        accessorKey: 'assignedRequests',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Demandes actives" />,
        cell: ({ row }) => {
          const activeRequests = row.original.assignedRequests?.length || 0;
          return (
            <Badge variant={activeRequests > 5 ? 'destructive' : 'secondary'}>
              {activeRequests}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'completedRequests',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Complétées" />,
        cell: ({ row }) => row.original.completedRequests || 0,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.dashboard.agent_detail(row.original.id)}>
              <Eye className="h-4 w-4 mr-2" />
              {t('common.actions.consult')}
            </Link>
          </Button>
        ),
      },
    ],
    [t],
  );

  // Définition des colonnes pour les demandes assignées
  const requestsColumns: ColumnDef<AgentDetails['assignedRequests'][0]>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="ID"
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'id',
                order: direction,
              })
            }
          />
        ),
        cell: ({ row }) => (
          <Link
            href={ROUTES.dashboard.service_requests(row.original.id)}
            className="font-mono text-sm hover:underline"
          >
            #{row.original.id.slice(-8)}
          </Link>
        ),
      },
      {
        accessorKey: 'serviceCategory',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('inputs.serviceCategory.label')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'serviceCategory',
                order: direction,
              })
            }
          />
        ),
        cell: ({ row }) => (
          <Badge variant="outline">
            {t(`inputs.serviceCategory.options.${row.original.serviceCategory}`)}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('inputs.status.label')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'status',
                order: direction,
              })
            }
          />
        ),
        cell: ({ row }) => {
          const status = statuses.find((status) => status.value === row.original.status);
          return (
            <Badge
              variant={
                row.original.status === 'COMPLETED'
                  ? 'default'
                  : [
                        'VALIDATED',
                        'CARD_IN_PRODUCTION',
                        'READY_FOR_PICKUP',
                        'APPOINTMENT_SCHEDULED',
                      ].includes(row.original.status)
                    ? 'default'
                    : 'secondary'
              }
            >
              {status?.label || row.original.status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'priority',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('inputs.priority.label')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'priority',
                order: direction,
              })
            }
          />
        ),
        cell: ({ row }) => (
          <Badge variant={row.original.priority === 'URGENT' ? 'destructive' : 'outline'}>
            {t(`inputs.priority.options.${row.original.priority}`)}
          </Badge>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('requests.table.submitted_at')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'createdAt',
                order: direction,
              })
            }
          />
        ),
        cell: ({ row }) => formatDate(new Date(row.original.createdAt), 'dd/MM/yyyy'),
      },
      {
        accessorKey: 'assignedAt',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Assigné le"
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'assignedAt',
                order: direction,
              })
            }
          />
        ),
        cell: ({ row }) =>
          row.original.assignedAt
            ? formatDate(new Date(row.original.assignedAt), 'dd/MM/yyyy')
            : '-',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.dashboard.service_requests(row.original.id)}>
              <FileText className="h-4 w-4 mr-2" />
              {t('common.actions.consult')}
            </Link>
          </Button>
        ),
      },
    ],
    [t, statuses, formatDate, handleSortingChange],
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN');
  const canManageAgent = isSuperAdmin || currentUser?.roles?.includes('ADMIN');
  const isManager = agent?.roles?.includes(UserRole.MANAGER);

  const handleAgentUpdate = (updatedAgent: AgentDetails) => {
    setAgent(updatedAgent);
    setIsEditSheetOpen(false);
  };

  useEffect(() => {
    async function fetchAgentDetails() {
      if (!agentId) return;

      setIsLoading(true);
      const result = await tryCatch(getAgentDetails(agentId));

      if (result.error) {
        setError(result.error.message || 'Failed to fetch agent details');
      } else if (result.data) {
        setAgent(result.data);
      }

      setIsLoading(false);
    }

    fetchAgentDetails();
  }, [agentId]);

  // Filter and paginate requests
  useEffect(() => {
    if (!agent?.assignedRequests) {
      setFilteredRequests([]);
      return;
    }

    let filtered = [...agent.assignedRequests];

    // Apply search filter
    if (tableParams.search) {
      const searchTerm = tableParams.search.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.id.toLowerCase().includes(searchTerm) ||
          request.serviceCategory?.toLowerCase().includes(searchTerm),
      );
    }

    // Apply status filter
    if (tableParams.status && tableParams.status.length > 0) {
      filtered = filtered.filter((request) =>
        tableParams.status!.includes(request.status),
      );
    }

    // Apply service category filter
    if (tableParams.serviceCategory && tableParams.serviceCategory.length > 0) {
      filtered = filtered.filter((request) =>
        tableParams.serviceCategory!.includes(request.serviceCategory),
      );
    }

    // Apply priority filter
    if (tableParams.priority && tableParams.priority.length > 0) {
      filtered = filtered.filter((request) =>
        tableParams.priority!.includes(request.priority),
      );
    }

    // Apply sorting
    if (sorting.field && sorting.order) {
      filtered.sort((a, b) => {
        const aValue = a[sorting.field as keyof typeof a];
        const bValue = b[sorting.field as keyof typeof b];

        // Handle null values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sorting.order === 'asc' ? -1 : 1;
        if (bValue == null) return sorting.order === 'asc' ? 1 : -1;

        if (aValue < bValue) return sorting.order === 'asc' ? -1 : 1;
        if (aValue > bValue) return sorting.order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredRequests(filtered);
  }, [agent?.assignedRequests, tableParams, sorting]);

  if (isLoading) {
    return (
      <PageContainer title="Chargement...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    );
  }

  if (error || !agent) {
    return (
      <PageContainer title="Erreur">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Agent introuvable</h2>
          <p className="text-muted-foreground">
            L&apos;agent demandé n&apos;existe pas ou vous n&apos;avez pas les droits pour
            le consulter.
          </p>
          <Button onClick={() => router.back()} variant="outline">
            Retour
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Calculer les statistiques
  const pendingRequests =
    agent.assignedRequests?.filter((r) =>
      ['SUBMITTED', 'PENDING', 'PENDING_COMPLETION'].includes(r.status),
    ).length || 0;

  const processingRequests =
    agent.assignedRequests?.filter((r) =>
      [
        'VALIDATED',
        'CARD_IN_PRODUCTION',
        'READY_FOR_PICKUP',
        'APPOINTMENT_SCHEDULED',
      ].includes(r.status),
    ).length || 0;

  const completedRequests =
    agent.assignedRequests?.filter((r) => r.status === 'COMPLETED').length || 0;
  const averageProcessingTime = agent.averageProcessingTime || 0;

  // Paginate filtered requests
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  return (
    <PageContainer 
      title={isManager ? "Détail du manager" : "Détail de l'agent"} 
      description={agent.name}>
      <div className="space-y-6">
        {/* Header avec informations de base */}
        <CardContainer
          title={
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={undefined} alt={agent.name || 'Agent'} />
                <AvatarFallback className="text-lg">
                  {agent.name ? getInitials(agent.name) : 'AG'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">{agent.name || 'Agent sans nom'}</h1>
                <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
                  {agent.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{agent.email}</span>
                    </div>
                  )}
                  {agent.phoneNumber && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{agent.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          }
          action={
            canManageAgent && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="!w-full xs:max-w-xl md:max-w-2xl">
                    <SheetHeader>
                      <SheetTitle>Modifier l&apos;agent</SheetTitle>
                      <SheetDescription>
                        Modifiez les informations de l&apos;agent {agent.name}
                      </SheetDescription>
                    </SheetHeader>
                    <EditAgentForm
                      agent={agent}
                      onSuccess={handleAgentUpdate}
                      onCancel={() => setIsEditSheetOpen(false)}
                    />
                  </SheetContent>
                </Sheet>
              </div>
            )
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Pays liés */}
            {agent.linkedCountries && agent.linkedCountries.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <Globe className="h-4 w-4" />
                  <span>Pays liés</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.linkedCountries.map((country) => (
                    <Badge key={country.code} variant="outline">
                      {country.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Services assignés */}
            {agent.assignedServices && agent.assignedServices.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <Briefcase className="h-4 w-4" />
                  <span>Services assignés</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.assignedServices.map((service) => (
                    <Badge key={service.id} variant="outline">
                      {service.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContainer>

        {/* Statistiques */}
        {isManager ? (
          // Statistiques pour Manager
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Agents managés"
              value={agent.managedAgents?.length || 0}
              description="Nombre total d'agents"
              icon={Users}
              className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/30"
              iconClassName="bg-white dark:bg-neutral-900 text-blue-500 dark:text-blue-400"
            />

            <StatsCard
              title="Demandes actives"
              value={
                agent.managedAgents?.reduce((sum, a) => sum + (a.assignedRequests?.length || 0), 0) || 0
              }
              description="Total des agents"
              icon={FileText}
              className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/30"
              iconClassName="bg-white dark:bg-neutral-900 text-amber-500 dark:text-amber-400"
            />

            <StatsCard
              title="Total complétées"
              value={
                agent.managedAgents?.reduce((sum, a) => sum + (a.completedRequests || 0), 0) || 0
              }
              description="Par tous les agents"
              icon={CheckCircle}
              className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/30"
              iconClassName="bg-white dark:bg-neutral-900 text-green-500 dark:text-green-400"
            />

            <StatsCard
              title="Temps moyen"
              value={
                agent.managedAgents && agent.managedAgents.length > 0
                  ? `${Math.round(
                      agent.managedAgents.reduce((sum, a) => sum + (a.averageProcessingTime || 0), 0) /
                        agent.managedAgents.length
                    )}j`
                  : '0j'
              }
              description="Moyenne des agents"
              icon={Calendar}
              className="bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800/30"
              iconClassName="bg-white dark:bg-neutral-900 text-purple-500 dark:text-purple-400"
            />
          </div>
        ) : (
          // Statistiques pour Agent
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Demandes en attente"
              value={pendingRequests}
              description="Demandes à traiter"
              icon={Clock}
              className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/30"
              iconClassName="bg-white dark:bg-neutral-900 text-amber-500 dark:text-amber-400"
            />

            <StatsCard
              title="En traitement"
              value={processingRequests}
              description="Demandes en cours"
              icon={FileText}
              className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/30"
              iconClassName="bg-white dark:bg-neutral-900 text-blue-500 dark:text-blue-400"
            />

            <StatsCard
              title="Complétées"
              value={completedRequests}
              description="Demandes finalisées"
              icon={CheckCircle}
              className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/30"
              iconClassName="bg-white dark:bg-neutral-900 text-green-500 dark:text-green-400"
            />

            <StatsCard
              title="Temps moyen"
              value={`${averageProcessingTime}j`}
              description="Traitement moyen"
              icon={Calendar}
              className="bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800/30"
              iconClassName="bg-white dark:bg-neutral-900 text-purple-500 dark:text-purple-400"
            />
          </div>
        )}

        {/* Section conditionnelle pour Manager ou Agent */}
        {isManager ? (
          // Section pour les managers - Afficher les agents managés
          <CardContainer
            title={
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Agents managés</span>
                <Badge variant="outline">{agent.managedAgents?.length || 0}</Badge>
              </div>
            }
            action={
              <Button variant="outline" size="sm" asChild>
                <Link href={ROUTES.dashboard.agents}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Voir tous les agents
                </Link>
              </Button>
            }
          >
            {agent.managedAgents && agent.managedAgents.length > 0 ? (
              <DataTable
                columns={managedAgentsColumns}
                data={agent.managedAgents}
                totalCount={agent.managedAgents.length}
                pageIndex={0}
                pageSize={10}
              />
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Aucun agent managé</p>
                <p className="text-muted-foreground">
                  Ce manager n&apos;a pas encore d&apos;agents assignés.
                </p>
              </div>
            )}
          </CardContainer>
        ) : (
          // Section pour les agents - Afficher les demandes assignées
          <CardContainer
            title={
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Demandes assignées</span>
                <Badge variant="outline">{agent.assignedRequests?.length || 0}</Badge>
              </div>
            }
            action={
              <Button variant="outline" size="sm" asChild>
                <Link href={ROUTES.dashboard.requests}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Gérer toutes les demandes
                </Link>
              </Button>
            }
          >
            {agent.assignedRequests && agent.assignedRequests.length > 0 ? (
              <DataTable
                columns={requestsColumns}
                data={paginatedRequests}
                filters={requestFilters}
                totalCount={filteredRequests.length}
                pageIndex={pagination.page - 1}
                pageSize={pagination.limit}
                onPageChange={(page) => handlePaginationChange('page', page + 1)}
                onLimitChange={(limit) => handlePaginationChange('limit', limit)}
                activeSorting={
                  sorting.field ? [sorting.field, sorting.order || 'asc'] : undefined
                }
              />
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Aucune demande assignée</p>
                <p className="text-muted-foreground">
                  Cet agent n&apos;a pas encore de demandes assignées.
                </p>
              </div>
            )}
          </CardContainer>
        )}

        {/* Disponibilité et statut */}
        {agent.availability && (
          <CardContainer
            title={
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Disponibilité</span>
              </div>
            }
          >
            <div className="text-sm text-muted-foreground">
              Informations de disponibilité à implémenter selon le modèle de données
            </div>
          </CardContainer>
        )}
      </div>
    </PageContainer>
  );
}
