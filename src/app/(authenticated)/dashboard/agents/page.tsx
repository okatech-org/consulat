'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getAgentsList,
  AgentsListRequestOptions,
  AgentListItem,
  AgentsListResult,
} from '@/actions/agents';
import { DataTable } from '@/components/data-table/data-table';
import { FilterOption } from '@/components/data-table/data-table-toolbar';
import { useTableSearchParams } from '@/components/utils/table-hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { PageContainer } from '@/components/layouts/page-container';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getActiveCountries } from '@/actions/countries';
import { getOrganizations } from '@/actions/organizations';
import { useCurrentUser } from '@/hooks/use-current-user';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { tryCatch } from '@/lib/utils';
import { getServices } from '../(superadmin)/_utils/actions/services';

interface SearchParams {
  search?: string;
  linkedCountries?: string[];
  assignedServices?: string[];
  assignedOrganizationId?: string[];
}

export default function AgentsListingPage() {
  const currentUser = useCurrentUser();
  const [data, setData] = useState<AgentsListResult>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN');

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
        isSuperAdmin
          ? undefined
          : (currentUser?.managedOrganizationId ?? currentUser?.assignedOrganizationId),
      );
      setServices(servicesRes.map((s) => ({ id: s.id, name: s.name })));
    }

    loadServices();
  }, [isSuperAdmin, currentUser]);

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
      ...(isSuperAdmin
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
    [countries, organizations, services, isSuperAdmin, handleParamsChange, params],
  );

  // Fetch agents à chaque changement de params
  useEffect(() => {
    setIsLoading(true);
    const fetch = async () => {
      const options: AgentsListRequestOptions = {
        search: params.search as string,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sorting.field
          ? {
              field: sorting.field as 'assignedServices' | 'country' | 'organizationId',
              direction: sorting.order || 'asc',
            }
          : undefined,
        assignedServices: (params.assignedServices as string[]) ?? undefined,
        country: (params.linkedCountries as string[]) ?? undefined,
        organizationId: (params.assignedOrganizationId as string[]) ?? undefined,
      };

      const result = await tryCatch(getAgentsList(options));

      if (result.data) setData(result.data);

      setIsLoading(false);
    };
    fetch();
  }, [params, pagination, sorting]);

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
              {row.original.assignedServices.map((s: { name: string; id: string }) => (
                <Badge key={s.id}>{s.name}</Badge>
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
          <Button asChild variant="outline" size="sm">
            <Link href={`${ROUTES.dashboard.agents}/${row.original.id}`}>Consulter</Link>
          </Button>
        ),
      },
    ],
    [],
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
          // Sinon, on n'ajoute pas la clé (tableau vide)
        } else {
          params[key] = value;
        }
      }
    });

    return params;
  }

  console.log({ params, pagination, sorting });

  return (
    <PageContainer title="Agents">
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={data.items}
        filters={filters}
        totalCount={data.total}
        pageIndex={data.page - 1}
        pageSize={data.limit}
        onPageChange={(page) => handlePaginationChange('page', page + 1)}
        onLimitChange={(limit) => handlePaginationChange('limit', limit)}
        activeSorting={
          sorting.field ? [sorting.field, sorting.order || 'asc'] : undefined
        }
      />
    </PageContainer>
  );
}
