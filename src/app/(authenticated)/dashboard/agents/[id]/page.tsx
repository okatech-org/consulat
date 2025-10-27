'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';
import { StatsCard } from '@/components/ui/stats-card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/data-table';
import type { FilterOption } from '@/components/data-table/data-table-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { useDateLocale } from '@/lib/utils';
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
import type { ColumnDef } from '@tanstack/react-table';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import {
  RequestStatus,
  ServiceCategory,
  RequestPriority,
  UserRole,
} from '@/convex/lib/constants';
import { AgentForm } from '@/components/organization/agent-form';
import { useTableSearchParams } from '@/hooks/use-table-search-params';
import { useManagers, useOrganizationAgents } from '@/hooks/use-agents';
import { useCountries } from '@/hooks/use-countries';
import { useServices } from '@/hooks/use-services';
import type { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface RequestFilters {
  search?: string;
  status?: RequestStatus[];
  serviceCategory?: ServiceCategory[];
  priority?: RequestPriority[];
}

// Types for the agent details from Convex
type ManagedAgent = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  assignedRequests: any[];
  completedRequests: number;
  averageProcessingTime: number;
};

type AssignedRequest = {
  id: string;
  serviceCategory?: ServiceCategory;
  status: RequestStatus;
  priority: RequestPriority;
  createdAt: number;
  assignedAt?: number;
};

// Simple component for managed agents list
function ManagedAgentsList({ agents }: { agents: ManagedAgent[] }) {
  return (
    <div className="space-y-4">
      {agents.map((agent) => (
        <div
          key={agent.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={undefined} alt={agent.name || 'Agent'} />
              <AvatarFallback>{agent.name?.[0] || 'A'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{agent.name || 'Sans nom'}</p>
              <p className="text-sm text-muted-foreground">
                {agent.email || "Pas d'email"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {agent.assignedRequests?.length || 0} demandes
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.dashboard.agent_detail(agent.id)}>
                <Eye className="h-4 w-4 mr-2" />
                Voir
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Component for assigned requests table
function AssignedRequestsTable({
  requests,
  onParamsChange,
  onSortingChange,
  onPaginationChange,
  tableParams,
  pagination,
  sorting,
}: {
  requests: AssignedRequest[];
  onParamsChange: <K extends keyof RequestFilters>(
    key: K,
    value: RequestFilters[K],
  ) => void;
  onSortingChange: (
    sorting: Partial<{ field?: keyof AssignedRequest; order?: 'asc' | 'desc' }>,
  ) => void;
  onPaginationChange: (key: 'page' | 'limit', value: number) => void;
  tableParams: RequestFilters;
  pagination: { page: number; limit: number };
  sorting: { field?: keyof AssignedRequest; order?: 'asc' | 'desc' };
}) {
  const t = useTranslations();
  const { formatDate } = useDateLocale();
  const [filteredRequests, setFilteredRequests] = useState<AssignedRequest[]>([]);

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
  const requestFilters = useMemo<FilterOption<AssignedRequest>[]>(
    () => [
      {
        type: 'search',
        property: 'search',
        label: t('requests.filters.search'),
        defaultValue: tableParams.search || '',
        onChange: (value: string) => onParamsChange('search', value),
      },
      {
        type: 'checkbox',
        property: 'status',
        label: t('inputs.status.label'),
        defaultValue: (tableParams.status as string[]) || [],
        options: statuses,
        onChange: (value: string[]) => onParamsChange('status', value as RequestStatus[]),
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
        onChange: (value: string[]) =>
          onParamsChange('serviceCategory', value as ServiceCategory[]),
      },
      {
        type: 'checkbox',
        property: 'priority',
        label: t('requests.filters.priority'),
        defaultValue: (tableParams.priority as string[]) || [],
        options: Object.values(RequestPriority).map((priority) => ({
          value: priority,
          label: t(`common.priority.${priority}`),
        })),
        onChange: (value: string[]) =>
          onParamsChange('priority', value as RequestPriority[]),
      },
    ],
    [t, tableParams, statuses, onParamsChange],
  );

  // Définition des colonnes pour les demandes assignées
  const requestsColumns: ColumnDef<AssignedRequest>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="ID"
            sortHandler={(direction) =>
              onSortingChange({
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
              onSortingChange({
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
              onSortingChange({
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
                row.original.status === RequestStatus.Completed
                  ? 'default'
                  : [
                        RequestStatus.Validated,
                        RequestStatus.InProduction,
                        RequestStatus.ReadyForPickup,
                        RequestStatus.AppointmentScheduled,
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
              onSortingChange({
                field: 'priority',
                order: direction,
              })
            }
          />
        ),
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.priority === RequestPriority.Urgent ? 'destructive' : 'outline'
            }
          >
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
              onSortingChange({
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
              onSortingChange({
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
    [t, statuses, formatDate, onSortingChange],
  );

  // Filter and paginate requests
  useEffect(() => {
    if (!requests) {
      setFilteredRequests([]);
      return;
    }

    let filtered = [...requests];

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
      filtered = filtered.filter(
        (request) =>
          request.serviceCategory &&
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
        const aValue = a[sorting.field as keyof AssignedRequest];
        const bValue = b[sorting.field as keyof AssignedRequest];

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
  }, [requests, tableParams, sorting]);

  // Paginate filtered requests
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  return (
    <DataTable
      columns={requestsColumns}
      data={paginatedRequests}
      filters={requestFilters}
      totalCount={filteredRequests.length}
      pageIndex={pagination.page - 1}
      pageSize={pagination.limit}
      onPageChange={(page) => onPaginationChange('page', page + 1)}
      onLimitChange={(limit) => onPaginationChange('limit', limit)}
      activeSorting={
        sorting.field
          ? [sorting.field as keyof AssignedRequest, sorting.order || 'asc']
          : undefined
      }
    />
  );
}

export default function AgentDetailPage() {
  const params = useParams<{
    id: Id<'memberships'>;
  }>();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();

  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Fetch agent details using Convex
  const agent = useQuery(api.functions.membership.getAgentDetails, {
    agentId: params.id,
  });

  // Fetch form data for the edit form
  const { countries } = useCountries();
  const { services } = useServices({
    organizationId: agent?.assignedOrganizationId,
  });
  const { managers } = useManagers(agent?.assignedOrganizationId);
  const { agents } = useOrganizationAgents(agent?.assignedOrganizationId);

  // Table state management
  const {
    params: tableParams,
    pagination,
    sorting,
    handleParamsChange,
    handleSortingChange,
    handlePaginationChange,
  } = useTableSearchParams<AssignedRequest, RequestFilters>(adaptSearchParams);

  function adaptSearchParams(urlSearchParams: URLSearchParams): RequestFilters {
    const filters: RequestFilters = {};

    const search = urlSearchParams.get('search');
    if (search) filters.search = search;

    const status = urlSearchParams.get('status');
    if (status) {
      const statusArray = status.split(',').filter(Boolean);
      if (statusArray.length > 0) {
        filters.status = statusArray as RequestStatus[];
      }
    }

    const serviceCategory = urlSearchParams.get('serviceCategory');
    if (serviceCategory) {
      const categoryArray = serviceCategory.split(',').filter(Boolean);
      if (categoryArray.length > 0) {
        filters.serviceCategory = categoryArray as ServiceCategory[];
      }
    }

    const priority = urlSearchParams.get('priority');
    if (priority) {
      const priorityArray = priority.split(',').filter(Boolean);
      if (priorityArray.length > 0) {
        filters.priority = priorityArray as RequestPriority[];
      }
    }

    return filters;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isSuperAdmin = currentUser?.roles?.includes(UserRole.SuperAdmin);
  const canManageAgent = isSuperAdmin || currentUser?.roles?.includes(UserRole.Admin);
  const isManager = agent?.roles?.includes(UserRole.Manager);

  if (agent === undefined) {
    return (
      <PageContainer title="Chargement...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    );
  }

  if (agent === null) {
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
      [
        RequestStatus.Submitted,
        RequestStatus.Pending,
        RequestStatus.PendingCompletion,
      ].includes(r.status),
    ).length || 0;

  const processingRequests =
    agent.assignedRequests?.filter((r) =>
      [
        RequestStatus.Validated,
        RequestStatus.InProduction,
        RequestStatus.ReadyForPickup,
        RequestStatus.AppointmentScheduled,
      ].includes(r.status),
    ).length || 0;

  const completedRequests =
    agent.assignedRequests?.filter((r) => r.status === RequestStatus.Completed).length ||
    0;
  const averageProcessingTime = agent?.averageProcessingTime || 0;

  return (
    <PageContainer
      title={isManager ? 'Détail du manager' : "Détail de l'agent"}
      description={agent.name}
    >
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
                  {agent.managedByUserId && !isManager && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Managé par un superviseur</span>
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
                  <SheetContent className="!w-full xs:max-w-xl md:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Modifier l&apos;agent</SheetTitle>
                      <SheetDescription>
                        Modifiez les informations de l&apos;agent {agent.name}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4">
                      <AgentForm
                        initialData={{
                          firstName: agent.name?.split(' ')[0] || '',
                          lastName: agent.name?.split(' ').slice(1).join(' ') || '',
                          email: agent.email || '',
                          phoneNumber: agent.phoneNumber || '',
                          countryCodes:
                            agent.linkedCountries
                              ?.filter((c) => '_id' in c)
                              .map((c) => c.code) || [],
                          serviceIds:
                            agent.assignedServices
                              ?.filter((s) => s !== null)
                              .map((s) => s!._id) || [],
                          assignedOrganizationId: agent.assignedOrganizationId || '',
                          roles: agent.roles.includes(UserRole.Manager)
                            ? ['MANAGER' as const]
                            : ['AGENT' as const],
                          managedByUserId: agent.managedByUserId || undefined,
                          managedAgentIds: agent.managedAgents?.map((a) => a.id) || [],
                        }}
                        isEditMode={true}
                        agentId={agent.id}
                        onSuccess={() => {
                          setIsEditSheetOpen(false);
                          router.refresh();
                        }}
                        countries={countries || []}
                        services={
                          services
                            ?.filter((s) => s !== null)
                            .map((s) => ({
                              id: s._id,
                              name: s.name,
                            })) || []
                        }
                        managers={
                          managers?.map((m) => ({
                            id: m._id || m.id || '',
                            name: m.name,
                          })) || []
                        }
                        agents={agents || []}
                      />
                    </div>
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
                  {agent.assignedServices
                    .filter((s) => s !== null)
                    .map((service) => (
                      <Badge key={service._id} variant="outline">
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
                agent.managedAgents?.reduce(
                  (sum, a) => sum + (a.assignedRequests?.length || 0),
                  0,
                ) || 0
              }
              description="Total des agents"
              icon={FileText}
              className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/30"
              iconClassName="bg-white dark:bg-neutral-900 text-amber-500 dark:text-amber-400"
            />

            <StatsCard
              title="Total complétées"
              value={
                agent.managedAgents?.reduce(
                  (sum, a) => sum + (a.completedRequests || 0),
                  0,
                ) || 0
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
                      agent.managedAgents.reduce(
                        (sum, a) => sum + (a.averageProcessingTime || 0),
                        0,
                      ) / agent.managedAgents.length,
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
              <ManagedAgentsList agents={agent.managedAgents} />
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
              <AssignedRequestsTable
                requests={agent.assignedRequests}
                onParamsChange={handleParamsChange}
                onSortingChange={handleSortingChange}
                onPaginationChange={handlePaginationChange}
                tableParams={tableParams}
                pagination={pagination}
                sorting={sorting}
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
