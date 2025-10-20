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
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { FilterOption } from '@/components/data-table/data-table-toolbar';
import { DataTable } from '@/components/data-table/data-table';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
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
  isActive?: boolean[];
}

function adaptSearchParams(searchParams: URLSearchParams): SearchParams {
  return {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category')?.split(',').filter(Boolean) as
      | ServiceCategory[]
      | undefined,
    organizationId: searchParams.get('organizationId')?.split(',').filter(Boolean),
    isActive: searchParams.get('isActive') === 'true' ? [true] : undefined,
  };
}

export function ServicesTable({ organizations }: ServicesTablesProps) {
  const { user: currentUser } = useCurrentUser();
  const organizationId = getOrganizationIdFromUser(currentUser);
  const isSuperAdmin = currentUser?.roles.includes(UserRole.SuperAdmin);

  const t_inputs = useTranslations('inputs');
  const t = useTranslations('services');
  const t_common = useTranslations('common');
  const toast = useToast();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const { params, pagination, handleParamsChange, handlePaginationChange } =
    useTableSearchParams<Service, SearchParams>(adaptSearchParams);

  const filterOrgId = isSuperAdmin ? params.organizationId?.[0] : (organizationId as any);

  const {
    services,
    total,
    isLoading,
    deleteService: deleteServiceMutation,
  } = useServices({
    search: params.search,
    organizationId: filterOrgId,
    status: params.isActive?.[0] ? ServiceStatus.Active : undefined,
    page: pagination.page,
    limit: pagination.limit,
  });

  const handleDelete = useCallback(
    async (service: Service) => {
      try {
        await deleteServiceMutation(service._id);
        setShowDeleteDialog(false);
        toast.toast({
          title: t('messages.deleteSuccess'),
          variant: 'success',
        });
      } catch (error) {
        toast.toast({
          title: t('messages.error.delete'),
          variant: 'destructive',
          description: String(error),
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
          accessorKey: 'code',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t_inputs('code')} />
          ),
          cell: ({ row }) => (
            <div className="font-medium">{String(row.getValue('code'))}</div>
          ),
        },
        {
          accessorKey: 'name',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t_inputs('name')} />
          ),
          cell: ({ row }) => <div>{String(row.getValue('name'))}</div>,
        },
        {
          accessorKey: 'category',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t('category')} />
          ),
          cell: ({ row }) => (
            <Badge variant="outline">{t(`categories.${row.getValue('category')}`)}</Badge>
          ),
        },
        ...(isSuperAdmin
          ? [
              {
                accessorKey: 'organizationId',
                header: ({ column }) => (
                  <DataTableColumnHeader
                    column={column}
                    title={t_common('organization')}
                  />
                ),
                cell: ({ row }) => (
                  <div>{getOrganizationName(String(row.getValue('organizationId')))}</div>
                ),
              } as ColumnDef<Service>,
            ]
          : []),
        {
          accessorKey: 'status',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={t_common('status')} />
          ),
          cell: ({ row }) => (
            <Badge
              variant={
                row.getValue('status') === ServiceStatus.Active ? 'default' : 'secondary'
              }
            >
              {row.getValue('status') === ServiceStatus.Active ? 'Active' : 'Inactive'}
            </Badge>
          ),
        },
        {
          id: 'actions',
          header: t_common('actions'),
          cell: ({ row }) => {
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
          { value: 'true', label: 'Active' },
          { value: 'false', label: 'Inactive' },
        ],
        defaultValue: params.isActive ? ['true'] : [],
        onChange: (value: string[]) => {
          handleParamsChange('isActive', value.length > 0 ? ['true'] : ['false']);
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
