'use client';

import {
  getServices,
  deleteService,
  duplicateService,
  updateServiceStatus,
} from '@/app/(authenticated)/dashboard/(superadmin)/_utils/actions/services';
import { useTableSearchParams } from '@/hooks/use-table-search-params';
import { useCurrentUser } from '@/hooks/use-current-user';
import { OrganizationListingItem } from '@/types/organization';
import { ServiceCategory, UserRole } from '@prisma/client';
import { useEffect, useState, useMemo } from 'react';
import { getOrganizationIdFromUser, tryCatch } from '@/lib/utils';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { ROUTES } from '@/schemas/routes';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef, Column, Row } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { FilterOption } from '@/components/data-table/data-table-toolbar';
import { DataTable } from '@/components/data-table/data-table';
import { ConsularServiceListingItem } from '@/types/consular-service';
import { SessionUser } from '@/types';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  DataTableRowActions,
  RowAction,
} from '@/components/data-table/data-table-row-actions';
import { Ban, CheckCircle, Copy, Pencil, Trash } from 'lucide-react';
import * as React from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getOrganizationFromId } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/services';

type ServicesTablesProps = {
  organizations: OrganizationListingItem[];
};

interface SearchParams {
  search?: string;
  category?: ServiceCategory[];
  organizationId?: string[];
  isActive?: boolean[];
}

interface ServicesListResult {
  items: ConsularServiceListingItem[];
  total: number;
}

export function ServicesTable({ organizations }: ServicesTablesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = useCurrentUser();
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
    async function fetchItems() {
      setIsLoading(true);
      const result = await tryCatch(getServices(defaultValues.organizationId?.[0]));

      if (result.data) {
        // Apply client-side filtering since getServices doesn't support all filters yet
        let filteredData = result.data;

        // Apply search filter
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filteredData = filteredData.filter(
            (service) =>
              service.name.toLowerCase().includes(searchLower) ||
              (service.description &&
                service.description.toLowerCase().includes(searchLower)),
          );
        }

        // Apply category filter
        if (params.category && params.category.length > 0) {
          filteredData = filteredData.filter((service) =>
            params.category!.includes(service.category),
          );
        }

        // Apply organization filter
        if (params.organizationId && params.organizationId.length > 0) {
          filteredData = filteredData.filter((service) =>
            params.organizationId!.includes(service.organizationId || ''),
          );
        }

        // Apply active status filter
        if (params.isActive && params.isActive.length > 0) {
          filteredData = filteredData.filter((service) =>
            params.isActive!.includes(service.isActive),
          );
        }

        // Apply sorting
        if (sorting.field) {
          filteredData.sort((a, b) => {
            const aValue = a[sorting.field as keyof ConsularServiceListingItem];
            const bValue = b[sorting.field as keyof ConsularServiceListingItem];

            if (aValue < bValue) return sorting.order === 'asc' ? -1 : 1;
            if (aValue > bValue) return sorting.order === 'asc' ? 1 : -1;
            return 0;
          });
        }

        // Apply pagination
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        setData({
          items: paginatedData,
          total: filteredData.length,
        });
      }

      setIsLoading(false);
    }

    fetchItems();
  }, [params, pagination, sorting, defaultValues]);

  const handleStatusChange = async (serviceId: string, status: boolean) => {
    setIsLoading(true);
    try {
      const result = await updateServiceStatus(serviceId, status);

      if (result.error) throw new Error(result.error);

      toast({
        title: t('messages.updateSuccess'),
        variant: 'success',
      });

      // Refresh data
      const refreshResult = await tryCatch(
        getServices(defaultValues.organizationId?.[0]),
      );
      if (refreshResult.data) {
        setData({ items: refreshResult.data, total: refreshResult.data.length });
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
  };

  const handleDelete = async (serviceId: string) => {
    setIsLoading(true);
    try {
      const result = await deleteService(serviceId);

      if (result.error) throw new Error(result.error);

      toast({
        title: t('messages.deleteSuccess'),
        variant: 'success',
      });

      // Refresh data
      const refreshResult = await tryCatch(
        getServices(defaultValues.organizationId?.[0]),
      );
      if (refreshResult.data) {
        setData({ items: refreshResult.data, total: refreshResult.data.length });
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
  };

  const handleDuplicateService = async (serviceId: string) => {
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
        const refreshResult = await tryCatch(
          getServices(defaultValues.organizationId?.[0]),
        );
        if (refreshResult.data) {
          setData({ items: refreshResult.data, total: refreshResult.data.length });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Colonnes du tableau
  const columns = useMemo<ColumnDef<ConsularServiceListingItem>[]>(
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
          <Badge variant={row.original.isActive ? 'success' : 'outline'}>
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
    ],
    [currentUser, organizations, t, t_inputs, t_common, isSuperAdmin],
  );

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
        defaultValue: params.category as ServiceCategory[],
        onChange: (value: ServiceCategory[]) => handleParamsChange('category', value),
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
          { value: true, label: t_common('status.ACTIVE') },
          { value: false, label: t_common('status.INACTIVE') },
        ],
        defaultValue: params.isActive as boolean[],
        onChange: (value: boolean[]) => handleParamsChange('isActive', value),
      },
    ],
    [
      organizations,
      currentUser,
      handleParamsChange,
      params,
      t,
      t_inputs,
      t_common,
      isSuperAdmin,
    ],
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
        const arr = value.split(',') as ServiceCategory[];
        if (arr.length > 0 && arr[0] !== '') {
          params[key] = arr;
        }
      } else if (key === 'organizationId') {
        const arr = value.split(',');
        if (arr.length > 0 && arr[0] !== '') {
          params[key] = arr;
        }
      } else if (key === 'isActive') {
        const arr = value.split(',').map((v) => v === 'true');
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
