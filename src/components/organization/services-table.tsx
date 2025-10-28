'use client';

import { useTableSearchParams } from '@/hooks/use-table-search-params';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useServices } from '@/hooks/use-services';
import { ServiceCategory, ServiceStatus, UserRole } from '@/convex/lib/constants';
import { useMemo, useCallback, useState } from 'react';
import { getOrganizationIdFromUser } from '@/lib/utils';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { ROUTES } from '@/schemas/routes';
import { Checkbox } from '@/components/ui/checkbox';
import type { ColumnDef, Table, Row, Column } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { FilterOption } from '@/components/data-table/data-table-toolbar';
import { DataTable } from '@/components/data-table/data-table';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Pencil, Trash } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import type { Doc } from '@/convex/_generated/dataModel';
import type { AllOrganizations } from '@/convex/lib/types';

type Service = Doc<'services'>;

type ServicesTablesProps = {
  organizations: AllOrganizations;
};

interface SearchParams {
  search?: string;
  category?: ServiceCategory[];
  organizationId?: string[];
  isActive?: ServiceStatus[];
}

function adaptSearchParams(searchParams: URLSearchParams): SearchParams {
  return {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category')?.split(',').filter(Boolean) as
      | ServiceCategory[]
      | undefined,
    organizationId: searchParams.get('organizationId')?.split(',').filter(Boolean),
    isActive:
      searchParams.get('isActive') === 'active' ? [ServiceStatus.Active] : undefined,
  };
}

export function ServicesTable({ organizations }: ServicesTablesProps) {
  const { user: currentUser } = useCurrentUser();
  const organizationId = getOrganizationIdFromUser(currentUser);
  const isSuperAdmin = currentUser?.roles.includes(UserRole.SuperAdmin);

  const t_inputs = useTranslations('inputs');
  const t = useTranslations('services');
  const t_common = useTranslations('common');

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const { params, pagination, handleParamsChange, handlePaginationChange } =
    useTableSearchParams<Service, SearchParams>(adaptSearchParams);

  const filterOrgId = isSuperAdmin ? params.organizationId?.[0] : organizationId;

  const {
    services,
    total,
    isLoading,
    deleteService: deleteServiceMutation,
  } = useServices({
    search: params.search,
    organizationId: filterOrgId,
    status: params.isActive?.[0],
    page: pagination.page,
    limit: pagination.limit,
  });

  const handleDelete = useCallback(
    async (service: Service) => {
      try {
        await deleteServiceMutation(service._id);
        setShowDeleteDialog(false);
        toast.success(t('messages.deleteSuccess'));
      } catch (error) {
        toast.error(t('messages.error.delete'), {
          description:
            error instanceof Error ? error.message : 'Une erreur est survenue.',
        });
      }
    },
    [deleteServiceMutation, t, toast],
  );

  const getOrganizationName = (orgId: string) => {
    return organizations.find((org) => org._id === orgId)?.name || 'Unknown';
  };

  const columns = useMemo<ColumnDef<Service>[]>(
    () =>
      [
        {
          id: 'select',
          header: ({ table }: { table: Table<Service> }) => (
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
          cell: ({ row }: { row: Row<Service> }) => (
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
          accessorKey: 'code',
          header: ({ column }: { column: Column<Service, unknown> }) => (
            <DataTableColumnHeader column={column} title={t_inputs('code')} />
          ),
          cell: ({ row }: { row: Row<Service> }) => (
            <div className="font-medium">{String(row.getValue('code'))}</div>
          ),
        },
        {
          accessorKey: 'name',
          header: ({ column }: { column: Column<Service, unknown> }) => (
            <DataTableColumnHeader column={column} title={t_inputs('name')} />
          ),
          cell: ({ row }: { row: Row<Service> }) => (
            <div>{String(row.getValue('name'))}</div>
          ),
        },
        {
          accessorKey: 'category',
          header: ({ column }: { column: Column<Service, unknown> }) => (
            <DataTableColumnHeader column={column} title={t('category')} />
          ),
          cell: ({ row }: { row: Row<Service> }) => (
            <Badge variant="outline">{t(`categories.${row.getValue('category')}`)}</Badge>
          ),
        },
        ...(isSuperAdmin
          ? [
              {
                accessorKey: 'organizationId',
                header: ({ column }: { column: Column<Service, unknown> }) => (
                  <DataTableColumnHeader
                    column={column}
                    title={t_common('organization')}
                  />
                ),
                cell: ({ row }: { row: Row<Service> }) => (
                  <div>{getOrganizationName(String(row.getValue('organizationId')))}</div>
                ),
              } as ColumnDef<Service>,
            ]
          : []),
        {
          accessorKey: 'status',
          header: ({ column }: { column: Column<Service, unknown> }) => (
            <DataTableColumnHeader column={column} title={t_common('status')} />
          ),
          cell: ({ row }: { row: Row<Service> }) => (
            <Badge
              variant={
                row.getValue('status') === ServiceStatus.Active ? 'default' : 'secondary'
              }
            >
              {row.getValue('status') === ServiceStatus.Active
                ? t_inputs('organization.status.options.active')
                : t_inputs('organization.status.options.inactive')}
            </Badge>
          ),
        },
        {
          id: 'actions',
          header: t_common('actions'),
          cell: ({ row }: { row: Row<Service> }) => {
            const service = row.original;
            return (
              <div className="flex gap-2">
                <Link
                  href={ROUTES.dashboard.edit_service(service._id)}
                  className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                >
                  <Pencil className="size-4" />
                </Link>
                <button
                  onClick={() => {
                    setSelectedService(service);
                    setShowDeleteDialog(true);
                  }}
                  className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                >
                  <Trash className="size-4 text-destructive" />
                </button>
              </div>
            );
          },
        },
      ].filter(Boolean) as ColumnDef<Service>[],
    [t, t_inputs, t_common, isSuperAdmin, getOrganizationName],
  );

  const filters = useMemo<FilterOption<Service>[]>(
    () => [
      {
        type: 'search',
        property: 'search',
        label: t_inputs('search'),
        defaultValue: params.search || '',
        onChange: (value: string) => handleParamsChange('search', value),
      },
      {
        type: 'checkbox',
        property: 'isActive',
        label: t_common('status'),
        options: [
          { value: 'active', label: t_inputs('organization.status.options.active') },
          { value: 'inactive', label: t_inputs('organization.status.options.inactive') },
        ],
        defaultValue: params.isActive?.includes(ServiceStatus.Active) ? ['active'] : [],
        onChange: (value: string[]) => {
          handleParamsChange(
            'isActive',
            value.length > 0 ? [ServiceStatus.Active] : undefined,
          );
        },
      },
      ...(isSuperAdmin
        ? [
            {
              type: 'radio' as const,
              property: 'organizationId',
              label: t_common('organization'),
              options: organizations.map((org) => ({
                value: org._id,
                label: org.name,
              })),
              defaultValue: params.organizationId?.[0] || '',
              onChange: (value: string) => {
                handleParamsChange('organizationId', value ? [value] : []);
              },
            },
          ]
        : []),
    ],
    [t, t_inputs, t_common, params, handleParamsChange, isSuperAdmin, organizations],
  );

  return (
    <>
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={services}
        filters={filters}
        totalCount={total}
        pageIndex={pagination.page - 1}
        pageSize={pagination.limit}
        onPageChange={(page) => handlePaginationChange('page', page + 1)}
        onLimitChange={(limit) => handlePaginationChange('limit', limit)}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          if (selectedService) {
            void handleDelete(selectedService);
          }
        }}
        title={t('dialogs.deleteService.title')}
        description={t('dialogs.deleteService.description')}
        variant="destructive"
      />
    </>
  );
}
