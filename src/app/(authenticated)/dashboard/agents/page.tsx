'use client';

import { useMemo } from 'react';
import { PageContainer } from '@/components/layouts/page-container';
import { CreateAgentButton } from '@/components/organization/create-agent-button';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAgents, type AgentFilters } from '@/hooks/use-agents';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useTableSearchParams } from '@/hooks/use-table-search-params';
import { ROUTES } from '@/schemas/routes';
import { CountryCode, UserRole } from '@/convex/lib/constants';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import type { FilterOption } from '@/components/data-table/data-table-toolbar';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import type { AgentListItem } from '@/convex/lib/types';

export default function AgentsPageClient() {
  const { user: currentUser } = useCurrentUser();
  const organizationId = currentUser?.membership?.organizationId;
  const isSuperAdmin = currentUser?.roles.includes(UserRole.SuperAdmin);

  // État pour les filtres
  const {
    params: tableParams,
    pagination,
    sorting,
    handleParamsChange,
    handleSortingChange,
    handlePaginationChange,
  } = useTableSearchParams<AgentListItem, AgentFilters>(adaptSearchParams);

  // Filtres par défaut selon le rôle de l'utilisateur
  const defaultFilters = useMemo(() => {
    const filters: AgentFilters = {
      page: pagination.page,
      limit: pagination.limit,
      sortBy: sorting.field
        ? {
            field: sorting.field as 'name' | 'email' | 'createdAt' | 'completedRequests',
            direction: sorting.order || 'asc',
          }
        : undefined,
    };

    // Filtrer par organisation si disponible
    if (organizationId) {
      filters.assignedOrganizationId = [organizationId];
    }

    // Les managers ne voient que leurs agents
    if (
      currentUser?.roles.includes(UserRole.Manager) &&
      !currentUser.roles.includes(UserRole.SuperAdmin) &&
      currentUser.membership?._id
    ) {
      filters.managedByUserId = [currentUser.membership?._id];
    }

    // Ajouter les filtres de la table
    if (tableParams.search) filters.search = tableParams.search;
    if (tableParams.linkedCountries?.length)
      filters.linkedCountries = tableParams.linkedCountries;
    if (tableParams.assignedServices?.length)
      filters.assignedServices = tableParams.assignedServices;
    if (tableParams.assignedOrganizationId?.length)
      filters.assignedOrganizationId = tableParams.assignedOrganizationId;
    if (tableParams.managedByUserId?.length)
      filters.managedByUserId = tableParams.managedByUserId;

    return filters;
  }, [pagination, sorting, tableParams, organizationId, currentUser]);

  // Hook principal pour les agents
  const { agents, total, isLoading } = useAgents(defaultFilters);

  // Fetch filter data
  const countries = useQuery(api.functions.membership.getCountriesForFilter) || [];
  const services =
    useQuery(api.functions.membership.getServicesForFilter, {
      organizationId: organizationId
        ? (organizationId as Id<'organizations'>)
        : undefined,
    }) || [];
  const organizations =
    useQuery(api.functions.organization.getAllOrganizations, {}) || [];
  const managers =
    useQuery(api.functions.membership.getManagersForFilter, {
      organizationId: organizationId
        ? (organizationId as Id<'organizations'>)
        : undefined,
    }) || [];

  // Fonction pour adapter les paramètres de recherche
  function adaptSearchParams(urlSearchParams: URLSearchParams): AgentFilters {
    const filters: AgentFilters = {};

    const search = urlSearchParams.get('search');
    if (search) filters.search = search;

    const linkedCountries = urlSearchParams.get('linkedCountries');
    if (linkedCountries) {
      filters.linkedCountries = linkedCountries
        .split(',')
        .filter(Boolean) as CountryCode[];
    }

    const assignedServices = urlSearchParams.get('assignedServices');
    if (assignedServices) {
      filters.assignedServices = assignedServices
        .split(',')
        .filter(Boolean) as Id<'services'>[];
    }

    const assignedOrganizationId = urlSearchParams.get('assignedOrganizationId');
    if (assignedOrganizationId) {
      filters.assignedOrganizationId = assignedOrganizationId
        .split(',')
        .filter(Boolean) as Id<'organizations'>[];
    }

    const managedByUserId = urlSearchParams.get('managedByUserId');
    if (managedByUserId) {
      filters.managedByUserId = managedByUserId
        .split(',')
        .filter(Boolean) as Id<'memberships'>[];
    }

    return filters;
  }

  // Définition des colonnes
  const columns: ColumnDef<AgentListItem>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Agent"
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'name',
                order: direction,
              })
            }
          />
        ),
        cell: ({ row }) => {
          const agent = row.original;
          const initials =
            agent.name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'AG';

          return (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={undefined} alt={agent.name || 'Agent'} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{agent.name || 'Sans nom'}</div>
                <div className="text-sm text-muted-foreground">{agent.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'roles',
        header: 'Rôle',
        cell: ({ row }) => {
          const user = row.original;
          if (!user.roles) return '-';

          if (user.roles.includes(UserRole.Manager)) {
            return <Badge>Manager</Badge>;
          } else if (user.roles.includes(UserRole.Agent)) {
            return <Badge variant="secondary">Agent</Badge>;
          }
          return '-';
        },
      },
      {
        accessorKey: 'linkedCountries',
        header: 'Pays',
        cell: ({ row }) =>
          row.original.linkedCountries && row.original.linkedCountries.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.original.linkedCountries.slice(0, 2).map((country) => (
                <Badge key={country.code} variant="outline" className="text-xs">
                  {country.name}
                </Badge>
              ))}
              {row.original.linkedCountries.length > 2 && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-xs">
                      +{row.original.linkedCountries.length - 2}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      {row.original.linkedCountries.slice(2).map((country) => (
                        <div key={country.code}>{country.name}</div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          ) : (
            '-'
          ),
      },
      {
        accessorKey: 'assignedServices',
        header: 'Services',
        cell: ({ row }) =>
          row.original.assignedServices && row.original.assignedServices.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.original.assignedServices.slice(0, 1).map((service) => (
                <Badge key={service?._id} variant="outline" className="text-xs">
                  <span className="truncate max-w-[80px]">{service?.name}</span>
                </Badge>
              ))}
              {row.original.assignedServices.length > 2 && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-xs">
                      +{row.original.assignedServices.length - 2}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      {row.original.assignedServices.slice(2).map((service) => (
                        <div key={service?._id}>{service?.name}</div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          ) : (
            '-'
          ),
      },
      {
        accessorKey: '_count.assignedRequests',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Demandes actives"
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'completedRequests',
                order: direction,
              })
            }
          />
        ),
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.assignedRequests || 0}</Badge>
        ),
      },
      {
        accessorKey: 'completedRequests',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Complétées"
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'completedRequests',
                order: direction,
              })
            }
          />
        ),
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.completedRequests || 0}</Badge>
        ),
      },
      // Colonne organisation pour les super admins
      ...(isSuperAdmin
        ? [
            {
              accessorKey: 'organizationName',
              header: 'Organisation',
              cell: ({ row }: { row: { original: AgentListItem } }) => {
                return row.original.organizationName || '-';
              },
            } as ColumnDef<AgentListItem>,
          ]
        : []),
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.dashboard.agent_detail(row.original._id)}>Consulter</Link>
          </Button>
        ),
      },
    ],
    [isSuperAdmin, handleSortingChange],
  );

  // Définition des filtres
  const filters: FilterOption<AgentListItem>[] = useMemo(
    () => [
      {
        type: 'search',
        property: 'search',
        label: 'Rechercher',
        defaultValue: tableParams.search as string,
        onChange: (value: string) => handleParamsChange('search', value),
      },
      {
        type: 'checkbox',
        property: 'linkedCountries',
        label: 'Pays',
        options: (countries || []).map((c) => ({
          value: c.code,
          label: c.name || c.code,
        })),
        defaultValue: tableParams.linkedCountries as string[],
        onChange: (value: string[]) =>
          handleParamsChange('linkedCountries', value as CountryCode[]),
      },
      {
        type: 'checkbox',
        property: 'assignedServices',
        label: 'Services',
        options: (services || []).map((s) => ({
          value: s._id.toString(),
          label: s.name || s._id.toString(),
        })),
        defaultValue: tableParams.assignedServices as string[],
        onChange: (value: string[]) =>
          handleParamsChange('assignedServices', value as Id<'services'>[]),
      },
      ...(isSuperAdmin
        ? [
            {
              type: 'checkbox' as const,
              property: 'assignedOrganizationId' as keyof AgentListItem,
              label: 'Organisation',
              options: (organizations || []).map((o) => ({
                value: o._id.toString(),
                label: o.name || o._id.toString(),
              })),
              defaultValue: tableParams.assignedOrganizationId as string[],
              onChange: (value: string[]) =>
                handleParamsChange(
                  'assignedOrganizationId',
                  value as Id<'organizations'>[],
                ),
            },
          ]
        : []),
      ...(!currentUser?.roles.includes(UserRole.Manager) ||
      currentUser?.roles.includes(UserRole.SuperAdmin)
        ? [
            {
              type: 'checkbox' as const,
              property: 'managedByUserId' as keyof AgentListItem,
              label: 'Géré par',
              options: (managers || []).map((m) => ({
                value: m.id?.toString() || '',
                label: m.name || m.email || 'Manager',
              })),
              defaultValue: tableParams.managedByUserId as string[],
              onChange: (value: string[]) =>
                handleParamsChange('managedByUserId', value as Id<'memberships'>[]),
            },
          ]
        : []),
    ],
    [
      countries,
      services,
      organizations,
      managers,
      currentUser,
      isSuperAdmin,
      tableParams,
      handleParamsChange,
    ],
  );

  return (
    <PageContainer
      title="Agents"
      action={
        <CreateAgentButton
          initialData={{
            assignedOrganizationId: organizationId,
          }}
          countries={countries || []}
        />
      }
    >
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={agents}
        filters={filters}
        totalCount={total}
        pageIndex={pagination.page - 1}
        pageSize={pagination.limit}
        onPageChange={(page) => handlePaginationChange('page', page + 1)}
        onLimitChange={(limit) => handlePaginationChange('limit', limit)}
        activeSorting={
          sorting.field ? [sorting.field, sorting.order || 'asc'] : undefined
        }
      />
    </PageContainer>
  );
}
