'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getAgentsList,
  AgentsListRequestOptions,
  AgentListItem,
  AgentsListResult,
} from '@/actions/agents';
import { DataTable } from '@/components/data-table/data-table';
import { FilterOption } from '@/components/data-table/data-table-toolbar';
import { useTableSearchParams } from '@/hooks/use-table-search-params';
import { Column, ColumnDef, Row } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getActiveCountries } from '@/actions/countries';
import { getOrganizations } from '@/actions/organizations';
import { useCurrentUser } from '@/hooks/use-current-user';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { tryCatch } from '@/lib/utils';
import { getServices } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/actions/services';
import { UserRole } from '@/convex/lib/constants';
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions';
import { Eye, Trash } from 'lucide-react';
import { EditAgentDialog } from './edit-agent-dialog';
import { useRouter } from 'next/navigation';

interface SearchParams {
  search?: string;
  linkedCountries?: string[];
  assignedServices?: string[];
  assignedOrganizationId?: string[];
}

interface AgentsTableWithFiltersProps {
  organizationId?: string;
}

export function AgentsTableWithFilters({ organizationId }: AgentsTableWithFiltersProps) {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const [data, setData] = useState<AgentsListResult>({
    items: [],
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentListItem | null>(null);
  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN');
  const isAdmin = currentUser?.roles?.includes('ADMIN');

  useEffect(() => {
    async function loadOrganizations() {
      const orgsRes = await getOrganizations();
      setOrganizations(orgsRes.map((o) => ({ id: o.id, name: o.name })));
    }

    if (isSuperAdmin) {
      loadOrganizations();
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    async function loadCountries() {
      const countriesRes = await getActiveCountries();
      setCountries(countriesRes.map((c) => ({ code: c.code, name: c.name })));
    }

    loadCountries();
  }, []);

  useEffect(() => {
    async function loadServices() {
      const servicesRes = await getServices(
        organizationId ||
          (isSuperAdmin
            ? undefined
            : (currentUser?.organizationId ?? currentUser?.assignedOrganizationId)),
      );
      setServices(servicesRes.map((s) => ({ id: s.id, name: s.name })));
    }

    loadServices();
  }, [isSuperAdmin, currentUser, organizationId]);

  // Gestion des paramètres d'URL/table (pagination, tri, filtres)
  const { params, pagination, sorting, handleParamsChange, handlePaginationChange } =
    useTableSearchParams<AgentListItem, SearchParams>(adaptSearchParams);

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
        options: countries.map((c) => ({ value: c.code, label: c.name })),
        defaultValue: params.linkedCountries as string[],
        onChange: (value: string[]) => handleParamsChange('linkedCountries', value),
      },
      {
        type: 'checkbox' as const,
        property: 'assignedServices',
        label: 'Services',
        options: services.map((s) => ({ value: s.id, label: s.name })),
        defaultValue: params.assignedServices as string[],
        onChange: (value: string[]) => handleParamsChange('assignedServices', value),
      },
      ...(isSuperAdmin && !organizationId
        ? [
            {
              type: 'checkbox' as const,
              property: 'assignedOrganizationId',
              label: 'Organisation',
              options: organizations.map((o) => ({ value: o.id, label: o.name })),
              defaultValue: params.assignedOrganizationId as string[],
              onChange: (value: string[]) =>
                handleParamsChange('assignedOrganizationId', value),
            },
          ]
        : []),
    ],
    [
      countries,
      organizations,
      services,
      isSuperAdmin,
      handleParamsChange,
      params,
      organizationId,
    ],
  );

  const getOrganizationId = useCallback(() => {
    if (organizationId) return organizationId;

    if (currentUser?.roles.includes('SUPER_ADMIN')) {
      return undefined;
    }

    if (currentUser?.organizationId) {
      return currentUser.organizationId;
    }

    if (currentUser?.assignedOrganizationId) {
      return currentUser.assignedOrganizationId;
    }

    return undefined;
  }, [currentUser, organizationId]);

  // Fetch agents à chaque changement de params
  useEffect(() => {
    setIsLoading(true);
    const fetch = async () => {
      const orgId = getOrganizationId();

      const options: AgentsListRequestOptions = {
        search: params.search as string,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sorting.field
          ? {
              field: sorting.field as
                | 'assignedServices'
                | 'country'
                | 'assignedOrganizationId' as any,
              direction: sorting.order || 'asc',
            }
          : undefined,
        assignedServices: (params.assignedServices as string[]) ?? undefined,
        linkedCountries: (params.linkedCountries as string[]) ?? undefined,
        assignedOrganizationId:
          params.assignedOrganizationId ?? (orgId ? [orgId] : undefined),
      };

      const result = await tryCatch(getAgentsList(options));

      if (result.data) setData(result.data);

      setIsLoading(false);
    };
    fetch();
  }, [params, pagination, sorting, currentUser, getOrganizationId]);

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
          const user = row.original as any;
          if (!user.roles) return '-';

          if (user.roles.includes(UserRole.MANAGER)) {
            return <Badge>Manager</Badge>;
          } else if (user.roles.includes(UserRole.AGENT)) {
            return <Badge variant="secondary">Agent</Badge>;
          }
          return '-';
        },
      },
      ...(isSuperAdmin && !organizationId
        ? [
            {
              accessorKey: 'assignedOrganizationId',
              header: ({ column }: { column: Column<AgentListItem, unknown> }) => (
                <DataTableColumnHeader column={column} title="Organisation" />
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
                <Badge key={c.code} variant="outline">
                  {c.name}
                </Badge>
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
              {row.original.assignedServices.map((s: { name: string; id: string }) => (
                <Badge key={s.id} variant="secondary">
                  {s.name}
                </Badge>
              ))}
            </div>
          ) : (
            '-'
          ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <DataTableRowActions<AgentListItem>
            actions={[
              {
                label: (
                  <>
                    <Eye className="size-icon" />
                    <span>Consulter</span>
                  </>
                ),
                onClick: (row) => router.push(ROUTES.dashboard.agent_detail(row.id)),
              },
              ...(isAdmin || isSuperAdmin
                ? [
                    {
                      label: (
                        <>
                          <Trash className="mr-1 size-4 text-destructive" />
                          <span className="text-destructive">Supprimer</span>
                        </>
                      ),
                      onClick: () => {
                        // TODO: Implémenter la suppression d'agent
                      },
                    },
                  ]
                : []),
            ]}
            row={row}
          />
        ),
      },
    ],
    [isSuperAdmin, isAdmin, organizations, router, organizationId],
  );

  function adaptSearchParams(urlSearchParams: URLSearchParams): SearchParams {
    const params: SearchParams = {};
    const paramsKeys: (keyof SearchParams)[] = [
      'search',
      'linkedCountries',
      'assignedServices',
      'assignedOrganizationId',
    ];

    paramsKeys.forEach((key) => {
      const value = urlSearchParams.get(key);
      if (value) {
        if (
          key === 'linkedCountries' ||
          key === 'assignedServices' ||
          key === 'assignedOrganizationId'
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

  const handleEditSuccess = () => {
    // Recharger la page pour mettre à jour les données
    window.location.reload();
  };

  return (
    <>
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
        activeSorting={
          sorting.field ? [sorting.field, sorting.order || 'asc'] : undefined
        }
      />
      {selectedAgent && (
        <EditAgentDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          agent={selectedAgent as any}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
