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
import { useCurrentUser } from '@/hooks/use-role-data';
import { useTableSearchParams } from '@/hooks/use-table-search-params';
import { getOrganizationIdFromUser } from '@/lib/utils';
import { ROUTES } from '@/schemas/routes';
import {
  UserRole,
  type ConsularService,
  type Country,
  type Organization,
  type User,
} from '@prisma/client';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import type { FilterOption } from '@/components/data-table/data-table-toolbar';
import type { AgentListItem } from '@/server/api/routers/agents/types';

export default function AgentsPageClient() {
  const { user: currentUser } = useCurrentUser();
  const organizationId = getOrganizationIdFromUser(currentUser);

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
    if (currentUser?.roles.includes('MANAGER') && !currentUser.roles.includes('ADMIN')) {
      filters.managedByUserId = [currentUser.id];
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
  const { agents, total, isLoading, error } = useAgents(defaultFilters);

  // Pour l'instant, utilisons des données vides pour les filtres
  // TODO: Créer les routers countries et organizations
  const countries: Country[] = [];
  const services: ConsularService[] = [];
  const organizations: Organization[] = [];
  const managers: User[] = [];

  // Fonction pour adapter les paramètres de recherche
  function adaptSearchParams(urlSearchParams: URLSearchParams): AgentFilters {
    const filters: AgentFilters = {};

    const search = urlSearchParams.get('search');
    if (search) filters.search = search;

    const linkedCountries = urlSearchParams.get('linkedCountries');
    if (linkedCountries) {
      filters.linkedCountries = linkedCountries.split(',').filter(Boolean);
    }

    const assignedServices = urlSearchParams.get('assignedServices');
    if (assignedServices) {
      filters.assignedServices = assignedServices.split(',').filter(Boolean);
    }

    const assignedOrganizationId = urlSearchParams.get('assignedOrganizationId');
    if (assignedOrganizationId) {
      filters.assignedOrganizationId = assignedOrganizationId.split(',').filter(Boolean);
    }

    const managedByUserId = urlSearchParams.get('managedByUserId');
    if (managedByUserId) {
      filters.managedByUserId = managedByUserId.split(',').filter(Boolean);
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

          if (user.roles.includes(UserRole.MANAGER)) {
            return <Badge>Manager</Badge>;
          } else if (user.roles.includes(UserRole.AGENT)) {
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
                <Badge key={service.id} variant="outline" className="text-xs">
                  <span className="truncate max-w-[80px]">{service.name}</span>
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
                        <div key={service.id}>{service.name}</div>
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
          <Badge variant="outline">{row.original._count.assignedRequests}</Badge>
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
      ...(currentUser?.roles.includes('SUPER_ADMIN')
        ? [
            {
              accessorKey: 'assignedOrganizationId',
              header: 'Organisation',
              cell: ({ row }: { row: { original: AgentListItem } }) => {
                const org = organizations?.find(
                  (item) => item.id === row.original.assignedOrganizationId,
                );
                return org?.name || '-';
              },
            } as ColumnDef<AgentListItem>,
          ]
        : []),
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button asChild variant="outline" size="sm">
            <Link href={`${ROUTES.dashboard.agents}/${row.original.id}`}>Consulter</Link>
          </Button>
        ),
      },
    ],
    [currentUser, organizations, handleSortingChange],
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
        onChange: (value: string[]) => handleParamsChange('linkedCountries', value),
      },
      {
        type: 'checkbox',
        property: 'assignedServices',
        label: 'Services',
        options: (services || []).map((s) => ({ value: s.id, label: s.name || s.id })),
        defaultValue: tableParams.assignedServices as string[],
        onChange: (value: string[]) => handleParamsChange('assignedServices', value),
      },
      ...(currentUser?.roles.includes('SUPER_ADMIN')
        ? [
            {
              type: 'checkbox' as const,
              property: 'assignedOrganizationId' as keyof AgentListItem,
              label: 'Organisation',
              options: (organizations || []).map((o) => ({
                value: o.id,
                label: o.name || o.id,
              })),
              defaultValue: tableParams.assignedOrganizationId as string[],
              onChange: (value: string[]) =>
                handleParamsChange('assignedOrganizationId', value),
            },
          ]
        : []),
      ...(!currentUser?.roles.includes('MANAGER') || currentUser?.roles.includes('ADMIN')
        ? [
            {
              type: 'checkbox' as const,
              property: 'managedByUserId' as keyof AgentListItem,
              label: 'Géré par',
              options: (managers || []).map((m) => ({
                value: m.id,
                label: m.name || m.id,
              })),
              defaultValue: tableParams.managedByUserId as string[],
              onChange: (value: string[]) => handleParamsChange('managedByUserId', value),
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
      tableParams,
      handleParamsChange,
    ],
  );

  if (error) {
    return (
      <PageContainer title="Agents">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg font-medium text-red-600">Erreur lors du chargement</p>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </PageContainer>
    );
  }

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
