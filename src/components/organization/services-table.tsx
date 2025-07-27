'use client';

import {
  getServicesList,
  deleteService,
  duplicateService,
  updateServiceStatus,
  type ServicesListRequestOptions,
  type ServicesListResult,
} from '@/app/(authenticated)/dashboard/(superadmin)/_utils/actions/services';
import { useTableSearchParams } from '@/hooks/use-table-search-params';
import { useCurrentUser } from '@/hooks/use-role-data';
import type { OrganizationListingItem } from '@/types/organization';
import { ServiceCategory, UserRole } from '@prisma/client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { getOrganizationFromId, getOrganizationIdFromUser, tryCatch } from '@/lib/utils';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { ROUTES } from '@/schemas/routes';
import { Checkbox } from '@/components/ui/checkbox';
import type { ColumnDef, Column, Row } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { FilterOption } from '@/components/data-table/data-table-toolbar';
import { DataTable } from '@/components/data-table/data-table';
import type { ConsularServiceListingItem } from '@/types/consular-service';
import type { SessionUser } from '@/types';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  DataTableRowActions,
  type RowAction,
} from '@/components/data-table/data-table-row-actions';
import { Ban, CheckCircle, Copy, Pencil, Trash } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type ServicesTablesProps = {
  organizations: OrganizationListingItem[];
};

interface SearchParams {
  search?: string;
  category?: ServiceCategory[];
  organizationId?: string[];
  isActive?: boolean[];
}

export function ServicesTable({ organizations }: ServicesTablesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentUser } = useCurrentUser();
  const organizationId = getOrganizationIdFromUser(currentUser as SessionUser);
  const isSuperAdmin = currentUser?.roles.includes(UserRole.SUPER_ADMIN);

  const t_inputs = useTranslations('inputs');
  const t = useTranslations('services');
  const t_common = useTranslations('common');
  const t_messages = useTranslations('messages');
  const [selectedService, setSelectedService] =
    useState<ConsularServiceListingItem | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const defaultValues: SearchParams = useMemo(
    () => ({
      ...(organizationId && !isSuperAdmin ? { organizationId: [organizationId] } : {}),
    }),
    [organizationId, isSuperAdmin],
  );

  const [data, setData] = useState<ServicesListResult>({
    items: [],
    total: 0,
  });

  const { params, pagination, sorting, handleParamsChange, handlePaginationChange } =
    useTableSearchParams<ConsularServiceListingItem, SearchParams>(adaptSearchParams);

  useEffect(() => {
    const options = buildQueryOptions(params, pagination, sorting, defaultValues);

    async function fetchItems() {
      setIsLoading(true);
      const result = await tryCatch(getServicesList(options));

      if (result.data) setData(result.data);

      setIsLoading(false);
    }

    fetchItems();
  }, [params, pagination, sorting, defaultValues]);

  const handleStatusChange = useCallback(
    async (serviceId: string, status: boolean) => {
      setIsLoading(true);
      try {
        const result = await updateServiceStatus(serviceId, status);

        if (result.error) throw new Error(result.error);

        toast({
          title: t('messages.updateSuccess'),
          variant: 'success',
        });

        // Refresh data
        const options = buildQueryOptions(params, pagination, sorting, defaultValues);
        const refreshResult = await tryCatch(getServicesList(options));
        if (refreshResult.data) {
          setData(refreshResult.data);
        }
      } catch (error) {
        toast({
          title: t('messages.error.update'),
          variant: 'destructive',
          description: `${error}`,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [params, pagination, sorting, defaultValues, t, toast],
  );

  const handleDelete = useCallback(
    async (serviceId: string) => {
      setIsLoading(true);
      try {
        const result = await deleteService(serviceId);

        if (result.error) throw new Error(result.error);

        toast({
          title: t('messages.deleteSuccess'),
          variant: 'success',
        });

        // Refresh data
        const options = buildQueryOptions(params, pagination, sorting, defaultValues);
        const refreshResult = await tryCatch(getServicesList(options));
        if (refreshResult.data) {
          setData(refreshResult.data);
        }
      } catch (error) {
        toast({
          title: t('messages.error.delete'),
          variant: 'destructive',
          description: `${error}`,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [params, pagination, sorting, defaultValues, t, toast],
  );

  const handleDuplicateService = useCallback(
    async (serviceId: string) => {
      setIsLoading(true);
      try {
        const result = await duplicateService(serviceId);
        if (result.error) {
          toast({
            title: t_messages('errors.duplicate'),
            description: result.error,
            variant: 'destructive',
          });
        } else {
          toast({
            title: t_messages('success.duplicate'),
            variant: 'success',
          });

          // Refresh data
          const options = buildQueryOptions(params, pagination, sorting, defaultValues);
          const refreshResult = await tryCatch(getServicesList(options));
          if (refreshResult.data) {
            setData(refreshResult.data);
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    [params, pagination, sorting, defaultValues, t_messages, toast],
  );

  // Colonnes du tableau
  const columns = useMemo<ColumnDef<ConsularServiceListingItem>[]>(() => {
    function getActions(
      row: Row<ConsularServiceListingItem>,
    ): RowAction<ConsularServiceListingItem>[] {
      const actions = [
        {
          label: (
            <>
              <Pencil className="mr-1 size-4" /> {t_common('actions.edit')}
            </>
          ),
          onClick: () => {
            router.push(ROUTES.dashboard.edit_service(row.original.id));
          },
        },
        {
          label: (
            <>
              <Copy className="mr-1 size-4" />
              {t_common('actions.duplicate')}
            </>
          ),
          onClick: () => {
            handleDuplicateService(row.original.id);
          },
        },
        {
          label: (
            <>
              {row.original.isActive ? (
                <>
                  <Ban className="mr-1 size-4" />
                  {t_common('actions.deactivate')}
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 size-4" />
                  {t_common('actions.activate')}
                </>
              )}
            </>
          ),
          onClick: () => {
            handleStatusChange(row.original.id, !row.original.isActive);
          },
        },
        {
          label: (
            <>
              <Trash className="mr-1 size-4 text-destructive" />
              <span className="text-destructive"> {t_common('actions.delete')}</span>
            </>
          ),
          onClick: () => {
            setSelectedService(row.original);
            setShowDeleteDialog(true);
          },
        },
      ];

      return actions;
    }

    return [
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
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.name')} />
        ),
        enableSorting: true,
      },
      {
        accessorKey: 'category',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t_inputs('serviceCategory.label')}
          />
        ),
        cell: ({ row }) => (
          <Badge variant="outline">
            {t_inputs(`serviceCategory.options.${row.original.category}`)}
          </Badge>
        ),
        filterFn: 'arrIncludesSome',
      },
      ...(isSuperAdmin
        ? [
            {
              accessorKey: 'organizationId',
              header: ({
                column,
              }: {
                column: Column<ConsularServiceListingItem, unknown>;
              }) => (
                <DataTableColumnHeader column={column} title={t('table.organization')} />
              ),
              cell: ({ row }: { row: Row<ConsularServiceListingItem> }) =>
                getOrganizationFromId(organizations, row.original.organizationId)
                  ?.name || (
                  <Badge variant="default">{t_common('status.NOT_ASSIGNED')}</Badge>
                ),
            },
          ]
        : []),
      {
        accessorKey: 'isActive',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.status')} />
        ),
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? 'default' : 'outline'}>
            {t_common(`status.${row.original.isActive ? 'ACTIVE' : 'INACTIVE'}`)}
          </Badge>
        ),
        enableSorting: true,
        sortingFn: 'auto',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <DataTableRowActions actions={getActions(row)} row={row} />,
      },
    ];
  }, [
    isSuperAdmin,
    t,
    t_inputs,
    organizations,
    t_common,
    router,
    handleDuplicateService,
    handleStatusChange,
    setSelectedService,
    setShowDeleteDialog,
  ]);

  // Définir les filtres disponibles
  const filters: FilterOption<ConsularServiceListingItem>[] = useMemo(
    () => [
      {
        type: 'search',
        property: 'search',
        label: t('table.name'),
        defaultValue: params.search as string,
        onChange: (value: string) => handleParamsChange('search', value),
      },
      {
        type: 'checkbox' as const,
        property: 'category',
        label: t('table.category'),
        options: Object.values(ServiceCategory).map((category) => ({
          value: category,
          label: t_inputs(`serviceCategory.options.${category}`),
        })),
        defaultValue: (params.category || []) as string[],
        onChange: (value: string[]) =>
          handleParamsChange('category', value as ServiceCategory[]),
      },
      ...(isSuperAdmin
        ? [
            {
              type: 'checkbox' as const,
              property: 'organizationId',
              label: t('table.organization'),
              options: organizations.map((org) => ({
                value: org.id,
                label: org.name || org.id,
              })),
              defaultValue: params.organizationId as string[],
              onChange: (value: string[]) => handleParamsChange('organizationId', value),
            },
          ]
        : []),
      {
        type: 'checkbox' as const,
        property: 'isActive',
        label: t('table.status'),
        options: [
          { value: 'true', label: t_common('status.ACTIVE') },
          { value: 'false', label: t_common('status.INACTIVE') },
        ],
        defaultValue: (params.isActive || []).map(String) as string[],
        onChange: (value: string[]) =>
          handleParamsChange(
            'isActive',
            value.map((v) => v === 'true'),
          ),
      },
    ],
    [organizations, handleParamsChange, params, t, t_inputs, t_common, isSuperAdmin],
  );

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
        onRowClick={(row) => {
          router.push(ROUTES.dashboard.edit_service(row.original.id));
        }}
      />

      {selectedService && (
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={() => handleDelete(selectedService?.id)}
          title={t_common('actions.delete')}
          description={t('actions.delete_confirm')}
          variant={'destructive'}
        />
      )}
    </>
  );
}

function adaptSearchParams(urlSearchParams: URLSearchParams): SearchParams {
  const params: SearchParams = {};
  const paramsKeys: (keyof SearchParams)[] = [
    'search',
    'category',
    'organizationId',
    'isActive',
  ];

  paramsKeys.forEach((key) => {
    const value = urlSearchParams.get(key);
    if (value) {
      if (key === 'category') {
        const arr = value.split(',').filter(Boolean) as ServiceCategory[];
        if (arr.length > 0) {
          params[key] = arr;
        }
      } else if (key === 'organizationId') {
        const arr = value.split(',').filter(Boolean);
        if (arr.length > 0) {
          params[key] = arr;
        }
      } else if (key === 'isActive') {
        const arr = value
          .split(',')
          .filter(Boolean)
          .map((v) => v === 'true');
        if (arr.length > 0) {
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
  pagination: { page: number; limit: number },
  sorting: { field?: string; order?: 'asc' | 'desc' },
  defaultValues: SearchParams,
): ServicesListRequestOptions {
  const options: ServicesListRequestOptions = {
    ...defaultValues,
    page: pagination.page ?? 1,
    limit: pagination.limit ?? 10,
  };

  if (sorting.field) {
    options.sortBy = {
      field: sorting.field as 'name' | 'category' | 'isActive' | 'createdAt',
      direction: sorting.order || 'asc',
    };
  }

  if (params.search) {
    options.search = params.search;
  }

  if (params.category) {
    options.category = params.category;
  }

  if (params.organizationId) {
    options.organizationId = params.organizationId;
  }

  if (params.isActive) {
    options.isActive = params.isActive;
  }

  return options;
}
