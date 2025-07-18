'use client';

import {
  type AgentListItem,
  type AgentsListRequestOptions,
  type AgentsListResult,
  getAgentsList,
} from '@/actions/agents';
import {
  type Sorting,
  type Pagination,
  useTableSearchParams,
} from '@/hooks/use-table-search-params';
import { useCurrentUser } from '@/hooks/use-role-data';
import type { OrganizationListingItem } from '@/types/organization';
import { type Country, type User, UserRole } from '@prisma/client';
import { useEffect, useState, useMemo } from 'react';
import { getOrganizationIdFromUser, tryCatch } from '@/lib/utils';
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
import type { ConsularServiceListingItem } from '@/types/consular-service';
import type { SessionUser } from '@/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type AgentsTablesProps = {
  countries: Country[];
  services: ConsularServiceListingItem[];
  organizations: OrganizationListingItem[];
  managers: User[];
};

interface SearchParams {
  search?: string;
  linkedCountries?: string[];
  assignedServices?: string[];
  assignedOrganizationId?: string[];
  managedByUserId?: string[];
}

export function AgentsTable({
  countries,
  services,
  organizations,
  managers,
}: AgentsTablesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentUser } = useCurrentUser();
  const organizationId = getOrganizationIdFromUser(currentUser as SessionUser);

  const defaultValues: SearchParams = useMemo(
    () => ({
      ...(organizationId ? { assignedOrganizationId: [organizationId] } : {}),
      ...(currentUser?.roles.includes('MANAGER')
        ? { managedByUserId: [currentUser.id] }
        : {}),
    }),
    [organizationId, currentUser],
  );

  const [data, setData] = useState<AgentsListResult>({
    items: [],
    total: 0,
  });

  const { params, pagination, sorting, handleParamsChange, handlePaginationChange } =
    useTableSearchParams<AgentListItem, SearchParams>(adaptSearchParams);

  useEffect(() => {
    const options = buildQueryOptions(params, pagination, sorting, defaultValues);

    async function fetchItems() {
      setIsLoading(true);
      const result = await tryCatch(getAgentsList(options));

      if (result.data) setData(result.data);

      setIsLoading(false);
    }

    fetchItems();
  }, [params, pagination, sorting, currentUser, defaultValues]);

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

          if (user.roles.includes(UserRole.MANAGER)) {
            return <Badge>Manager</Badge>;
          } else if (user.roles.includes(UserRole.AGENT)) {
            return <Badge variant="secondary">Agent</Badge>;
          }
          return '-';
        },
      },
      ...(currentUser?.roles.includes('SUPER_ADMIN')
        ? [
            {
              accessorKey: 'assignedOrganizationId',
              header: ({ column }: { column: Column<AgentListItem, unknown> }) => (
                <DataTableColumnHeader column={column} title="ID Organisation" />
              ),
              cell: ({ row }: { row: Row<AgentListItem> }) => {
                const org = organizations.find(
                  (item) => item.id === row.original.assignedOrganizationId,
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
                      {row.original.assignedServices.map(
                        (s: { name: string; id: string }) => (
                          <div key={s.id} className="text-xs">
                            {s.name}
                          </div>
                        ),
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              }
            </div>
          ) : (
            '-'
          ),
      },
      ...(!currentUser?.roles.includes('MANAGER')
        ? [
            {
              accessorKey: 'managedByUserId',
              header: ({ column }: { column: Column<AgentListItem, unknown> }) => (
                <DataTableColumnHeader column={column} title="Géré par" />
              ),
              cell: ({ row }: { row: Row<AgentListItem> }) => {
                const manager = managers.find(
                  (item) => item.id === row.original.managedByUserId,
                );
                return manager?.name || '-';
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

  // Définir les filtres disponibles (à adapter selon les besoins)
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
        options: countries.map((c) => ({ value: c.code, label: c.name || c.code })),
        defaultValue: params.linkedCountries as string[],
        onChange: (value: string[]) => handleParamsChange('linkedCountries', value),
      },
      {
        type: 'checkbox' as const,
        property: 'assignedServices',
        label: 'Services',
        options: services.map((s) => ({ value: s.id, label: s.name || s.id })),
        defaultValue: params.assignedServices as string[],
        onChange: (value: string[]) => handleParamsChange('assignedServices', value),
      },
      ...(currentUser?.roles.includes('SUPER_ADMIN')
        ? [
            {
              type: 'checkbox' as const,
              property: 'assignedOrganizationId',
              label: 'Organisation',
              options: organizations.map((o) => ({ value: o.id, label: o.name || o.id })),
              defaultValue: params.assignedOrganizationId as string[],
              onChange: (value: string[]) =>
                handleParamsChange('assignedOrganizationId', value),
            },
          ]
        : []),
      ...(!currentUser?.roles.includes('MANAGER')
        ? [
            {
              type: 'checkbox' as const,
              property: 'managedByUserId',
              label: 'Géré par',
              options: managers.map((m) => ({ value: m.id, label: m.name || m.id })),
              defaultValue: params.managedByUserId as string[],
              onChange: (value: string[]) => handleParamsChange('managedByUserId', value),
            },
          ]
        : []),
    ],
    [
      countries,
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
      data={data.items}
      filters={filters}
      totalCount={data.total}
      pageIndex={pagination.page - 1}
      pageSize={pagination.limit}
      onPageChange={(page) => handlePaginationChange('page', page + 1)}
      onLimitChange={(limit) => handlePaginationChange('limit', limit)}
      activeSorting={sorting.field ? [sorting.field, sorting.order || 'asc'] : undefined}
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
          params[key] = arr;
        }
      } else {
        params[key] = value;
      }
    }
  });

  return params;
}

function buildQueryOptions(
  params: SearchParams,
  pagination: Pagination,
  sorting: Sorting<AgentListItem>,
  defaultValues: SearchParams,
) {
  const options: AgentsListRequestOptions = {
    ...defaultValues,
    page: pagination.page ?? 1,
    limit: pagination.limit ?? 10,
  };

  if (sorting.field) {
    options.sortBy = {
      field: sorting.field as 'assignedServices' | 'country' | 'organizationId',
      direction: sorting.order,
    };
  }

  if (params.search) {
    options.search = params.search;
  }

  if (params.linkedCountries) {
    options.linkedCountries = params.linkedCountries;
  }

  if (params.assignedServices) {
    options.assignedServices = params.assignedServices;
  }

  if (params.assignedOrganizationId) {
    options.assignedOrganizationId = params.assignedOrganizationId;
  }

  if (params.managedByUserId) {
    options.managedByUserId = params.managedByUserId;
  }

  return options;
}
