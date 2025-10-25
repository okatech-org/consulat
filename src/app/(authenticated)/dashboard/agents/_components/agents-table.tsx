'use client';

import { useTableSearchParams } from '@/hooks/use-table-search-params';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { Organization } from '@/convex/lib/types';
import { UserRole, CountryStatus } from '@/convex/lib/constants';
import { useMemo } from 'react';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { ROUTES } from '@/schemas/routes';
import { Checkbox } from '@/components/ui/checkbox';
import type { ColumnDef, Column, Row } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { FilterOption } from '@/components/data-table/data-table-toolbar';
import { DataTable } from '@/components/data-table/data-table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { CountryCode } from '@/convex/lib/constants';
import type { AgentListItem } from '@/convex/lib/types';

type AgentsTablesProps = {
  organizations: Organization[];
  defaultOrganizationId?: Id<'organizations'>;
};

interface SearchParams {
  search?: string;
  linkedCountries?: CountryCode[];
  assignedServices?: Id<'services'>;
  assignedOrganizationId?: Id<'organizations'>;
  managedByUserId?: Id<'memberships'>;
}

export function AgentsTable({ organizations, defaultOrganizationId }: AgentsTablesProps) {
  const { user: currentUser } = useCurrentUser();

  const { params, pagination, handleParamsChange, handlePaginationChange } =
    useTableSearchParams<AgentListItem, SearchParams>(adaptSearchParams);

  const agentsResult = useQuery(api.functions.membership.getAgentsList, {
    organizationId: defaultOrganizationId || params.assignedOrganizationId,
    search: params.search,
    linkedCountries: params.linkedCountries,
    assignedServices: params.assignedServices,
    page: pagination.page,
    limit: pagination.limit,
  });

  const activeCountries = useQuery(api.functions.country.getAllCountries, {
    status: CountryStatus.Active,
  });

  const services = useQuery(api.functions.service.getAllServices, {
    organizationId: defaultOrganizationId ?? undefined,
  });

  const managers = useQuery(
    api.functions.membership.getManagersForFilter,
    defaultOrganizationId ? { organizationId: defaultOrganizationId } : 'skip',
  );

  const data = agentsResult?.agents || [];
  const total = agentsResult?.total || 0;
  const isLoading = agentsResult === undefined;

  // Colonnes du tableau
  const columns = useMemo<ColumnDef<AgentListItem>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nom" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={undefined} alt={row.original.name || '-'} />
            </Avatar>
            <span className="font-medium">{row.original.name}</span>
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
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Téléphone" />
        ),
        cell: ({ row }) => row.original.phoneNumber || '-',
      },
      {
        header: 'Rôle',
        accessorKey: 'roles',
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
      ...(currentUser?.roles.includes(UserRole.SuperAdmin)
        ? [
            {
              accessorKey: 'assignedOrganizationId',
              header: ({ column }: { column: Column<AgentListItem, unknown> }) => (
                <DataTableColumnHeader column={column} title="ID Organisation" />
              ),
              cell: ({ row }: { row: Row<AgentListItem> }) => {
                const org = organizations.find(
                  (item) => item?._id === row.original.assignedOrganizationId,
                );
                return org?.name || '-';
              },
            },
          ]
        : []),
      {
        accessorKey: 'linkedCountries',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Pays" />,
        cell: ({ row }) =>
          row.original.linkedCountries && row.original.linkedCountries.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.original.linkedCountries.map((c) => (
                <Badge key={c.code}>{c.name}</Badge>
              ))}
            </div>
          ) : (
            '-'
          ),
      },
      {
        accessorKey: 'assignedServices',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Services" />
        ),
        cell: ({ row }) =>
          row.original.assignedServices && row.original.assignedServices.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="cursor-help">
                      {row.original.assignedServices.length} services
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      {row.original.assignedServices.map((s) => (
                        <div key={s?._id} className="text-xs">
                          {s?.name}
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              }
            </div>
          ) : (
            '-'
          ),
      },
      ...(!currentUser?.roles.includes(UserRole.Manager)
        ? [
            {
              accessorKey: 'managedByUserId',
              header: ({ column }: { column: Column<AgentListItem, unknown> }) => (
                <DataTableColumnHeader column={column} title="Géré par" />
              ),
              cell: ({ row }: { row: Row<AgentListItem> }) => {
                return row.original.managerName || '-';
              },
            },
          ]
        : []),
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button asChild variant="outline" size="mobile">
            <Link href={`${ROUTES.dashboard.agents}/${row.original.id}`}>Consulter</Link>
          </Button>
        ),
      },
    ],
    [currentUser, organizations, managers],
  );

  // Définir les filtres disponibles
  const filters: FilterOption<AgentListItem>[] = useMemo(
    () => [
      {
        type: 'search',
        property: 'search',
        label: 'Rechercher',
        defaultValue: params.search as string,
        onChange: (value: string) => handleParamsChange('search', value),
      },
      {
        type: 'checkbox' as const,
        property: 'linkedCountries',
        label: 'Pays',
        options:
          activeCountries?.map((c) => ({
            value: c.code,
            label: c.name || c.code,
          })) || [],
        defaultValue: (params.linkedCountries as string[]) || [],
        onChange: (value: string[]) =>
          handleParamsChange('linkedCountries', value as CountryCode[]),
      },
      {
        type: 'radio' as const,
        property: 'assignedServices',
        label: 'Services',
        options: services?.map((s) => ({ value: s._id, label: s.name || s._id })) || [],
        defaultValue: (params.assignedServices as string) || '',
        onChange: (value: string) =>
          handleParamsChange('assignedServices', value as Id<'services'>),
      },
      ...(currentUser?.roles.includes(UserRole.SuperAdmin)
        ? [
            {
              type: 'radio' as const,
              property: 'assignedOrganizationId',
              label: 'Organisation',
              options: organizations
                .filter((o) => o && o._id && o.name)
                .map((o) => ({
                  value: o!._id as string,
                  label: o!.name as string,
                })),
              defaultValue: (params.assignedOrganizationId as string) || '',
              onChange: (value: string) =>
                handleParamsChange(
                  'assignedOrganizationId',
                  value as Id<'organizations'>,
                ),
            },
          ]
        : []),
      ...(!currentUser?.roles.includes(UserRole.Manager)
        ? [
            {
              type: 'radio' as const,
              property: 'managedByUserId',
              label: 'Géré par',
              options:
                managers
                  ?.filter((m) => m._id && m.name)
                  .map((m) => ({ value: m._id as string, label: m.name as string })) ||
                [],
              defaultValue: (params.managedByUserId as string) || '',
              onChange: (value: string) =>
                handleParamsChange('managedByUserId', value as Id<'memberships'>),
            },
          ]
        : []),
    ],
    [
      activeCountries,
      organizations,
      services,
      managers,
      currentUser,
      handleParamsChange,
      params,
    ],
  );

  return (
    <DataTable
      isLoading={isLoading}
      columns={columns}
      data={data}
      filters={filters}
      totalCount={total}
      pageIndex={pagination.page - 1}
      pageSize={pagination.limit}
      onPageChange={(page) => handlePaginationChange('page', page + 1)}
      onLimitChange={(limit) => handlePaginationChange('limit', limit)}
    />
  );
}

function adaptSearchParams(urlSearchParams: URLSearchParams): SearchParams {
  const params: SearchParams = {};
  const paramsKeys: (keyof SearchParams)[] = [
    'search',
    'linkedCountries',
    'assignedServices',
    'assignedOrganizationId',
    'managedByUserId',
  ];

  paramsKeys.forEach((key) => {
    const value = urlSearchParams.get(key);
    if (value) {
      if (
        key === 'linkedCountries' ||
        key === 'assignedServices' ||
        key === 'assignedOrganizationId' ||
        key === 'managedByUserId'
      ) {
        const arr = value.split(',');
        if (arr.length > 0 && arr[0] !== '') {
          params[key] = arr as Id<'services'> &
            CountryCode[] &
            Id<'organizations'> &
            Id<'memberships'>;
        }
      } else {
        params[key] = value;
      }
    }
  });

  return params;
}
