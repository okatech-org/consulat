'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import { FileText } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { useDateLocale } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { FilterOption } from '@/components/data-table/data-table-toolbar';
import { FullServiceRequest, PaginatedServiceRequests } from '@/types/service-request';
import { GetRequestsOptions } from '@/actions/service-requests';
import { RequestStatus, ServiceCategory, ServicePriority } from '@prisma/client';
import { hasAnyRole } from '@/lib/permissions/utils';
import { User } from '@prisma/client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { SessionUser } from '@/types';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface RequestsTableProps {
  user: SessionUser;
  filters: GetRequestsOptions;
  agents?: User[];
  availableServiceCategories: ServiceCategory[];
  initialData: PaginatedServiceRequests;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function RequestsTable({
  user,
  filters,
  agents,
  availableServiceCategories = [],
  initialData,
  isLoading = false,
  onRefresh,
}: RequestsTableProps) {
  const t = useTranslations();
  const { formatDate } = useDateLocale();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Navigation function that's not called during render
  const navigateWithParams = React.useCallback(
    (params: URLSearchParams) => {
      const url = `${pathname}?${params.toString()}`;
      router.push(url);
    },
    [pathname, router],
  );

  // Handle filter changes outside of render
  const handleFilterChange = React.useCallback(
    (name: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update params
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }

      // Use a timeout to avoid React update during render errors
      setTimeout(() => navigateWithParams(params), 0);
    },
    [searchParams, navigateWithParams],
  );

  // Handle page change
  const handlePageChange = React.useCallback(
    (newPage: number) => {
      // Convert 0-based index to 1-based for URL
      const pageParam = String(newPage + 1);

      const params = new URLSearchParams(searchParams.toString());
      params.set('page', pageParam);

      // Use setTimeout to avoid React errors
      setTimeout(() => navigateWithParams(params), 0);
    },
    [searchParams, navigateWithParams],
  );

  // Handle page size change
  const handleLimitChange = React.useCallback(
    (newLimit: number) => {
      const limitParam = String(newLimit);

      const params = new URLSearchParams(searchParams.toString());
      params.set('limit', limitParam);
      params.set('page', '1'); // Reset to first page when changing limit

      // Use setTimeout to avoid React errors
      setTimeout(() => navigateWithParams(params), 0);
    },
    [searchParams, navigateWithParams],
  );

  const statuses: {
    value: RequestStatus;
    label: string;
  }[] = [
    {
      value: RequestStatus.DRAFT,
      label: t(`common.status.${RequestStatus.DRAFT}`),
    },
    {
      value: RequestStatus.SUBMITTED,
      label: t(`common.status.${RequestStatus.SUBMITTED}`),
    },
    { value: RequestStatus.PENDING, label: t(`common.status.${RequestStatus.PENDING}`) },
    {
      value: RequestStatus.PENDING_COMPLETION,
      label: t(`common.status.${RequestStatus.PENDING_COMPLETION}`),
    },
    {
      value: RequestStatus.APPOINTMENT_SCHEDULED,
      label: t(`common.status.${RequestStatus.APPOINTMENT_SCHEDULED}`),
    },
    {
      value: RequestStatus.READY_FOR_PICKUP,
      label: t(`common.status.${RequestStatus.READY_FOR_PICKUP}`),
    },
    {
      value: RequestStatus.VALIDATED,
      label: t(`common.status.${RequestStatus.VALIDATED}`),
    },
    {
      value: RequestStatus.REJECTED,
      label: t(`common.status.${RequestStatus.REJECTED}`),
    },
    {
      value: RequestStatus.COMPLETED,
      label: t(`common.status.${RequestStatus.COMPLETED}`),
    },
  ];

  const columns: ColumnDef<PaginatedServiceRequests['items'][number]>[] = [
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
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      cell: ({ row }) => <div className="w-[80px] truncate">{row.getValue('id')}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'identityPictureUrl',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Photo d'identité" />
      ),
      cell: ({ row }) => {
        const url = row.original.requestedFor?.identityPicture?.fileUrl as string;
        return url ? (
          <Avatar>
            <AvatarImage src={url} />
          </Avatar>
        ) : (
          '-'
        );
      },
    },
    {
      accessorKey: 'firstName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.firstName.label')} />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.original.requestedFor?.firstName}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'lastName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.lastName.label')} />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.original.requestedFor?.lastName}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('requests.table.submitted_at')} />
      ),
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return date ? formatDate(date, 'dd/MM/yyyy') : '-';
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.status.label')} />
      ),
      cell: ({ row }) => {
        const status = statuses.find((status) => status.value === row.getValue('status'));

        if (!status) {
          return null;
        }

        return (
          <div className="flex min-w-max items-center">
            <Badge variant={'outline'}>{status.label}</Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'serviceCategory',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('inputs.serviceCategory.label')}
        />
      ),
      cell: ({ row }) => {
        const serviceCategory = Object.values(ServiceCategory).find(
          (serviceCategory) => serviceCategory === row.getValue('serviceCategory'),
        );

        if (!serviceCategory) {
          return null;
        }

        return (
          <div className="flex items-center">
            <Badge variant={'outline'}>
              {t(`inputs.serviceCategory.options.${serviceCategory}`)}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'priority',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.priority.label')} />
      ),
      cell: ({ row }) => {
        const priority = Object.values(ServicePriority).find(
          (priority) => priority === row.getValue('priority'),
        );

        if (!priority) {
          return null;
        }

        return (
          <div className="flex items-center">
            <Badge variant={priority === 'URGENT' ? 'destructive' : 'outline'}>
              {/* @ts-expect-error - translations are in lowercase */}
              {t('inputs.priority.options.' + priority)}
            </Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
  ];

  const isAdmin = hasAnyRole(user, ['ADMIN', 'MANAGER', 'SUPER_ADMIN']);

  if (isAdmin) {
    columns.push({
      accessorKey: 'assignedTo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('requests.table.assigned_to')} />
      ),
      cell: ({ row }) => {
        const assignedTo = row.original.assignedTo;
        return assignedTo ? assignedTo.name : '-';
      },
    });
  }

  columns.push({
    id: 'actions',
    cell: ({ row }) => (
      <Button variant={'outline'} asChild>
        <Link
          target="_blank"
          onClick={(e) => e.stopPropagation()}
          href={ROUTES.dashboard.service_requests(row.original.id)}
        >
          <FileText className="size-icon" />
          {t('common.actions.consult')}
        </Link>
      </Button>
    ),
  });

  const localFilters: FilterOption<FullServiceRequest>[] = [
    {
      type: 'search',
      label: t('requests.filters.search'),
      defaultValue: filters.search ?? '',
      onChange: (value) => handleFilterChange('search', value),
    },
    {
      type: 'checkbox',
      property: 'serviceCategory',
      label: t('requests.filters.service_category'),
      defaultValue: filters.serviceCategory?.toString().split(',') ?? [],
      options: availableServiceCategories.map((category) => ({
        value: category,
        label: t(`inputs.serviceCategory.options.${category}`),
      })),
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('serviceCategory', value.join(','));
        }
      },
      isDisabled: !hasAnyRole(user, ['ADMIN', 'MANAGER', 'AGENT', 'SUPER_ADMIN']),
    },
    {
      type: 'checkbox',
      property: 'status',
      label: t('requests.filters.status'),
      defaultValue: filters.status?.toString().split(',') ?? [],
      options: statuses,
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('status', value.join(','));
        }
      },
    },
    {
      type: 'checkbox',
      property: 'priority',
      label: t('requests.filters.priority'),
      defaultValue: filters.priority?.toString().split(',') ?? [],
      options: Object.values(ServicePriority).map((priority) => ({
        value: priority,
        label: t(`common.priority.${priority}`),
      })),
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('priority', value.join(','));
        }
      },
    },
  ];

  if (isAdmin && agents) {
    localFilters.push({
      type: 'checkbox',
      property: 'assignedTo',
      label: t('requests.filters.assigned_to'),
      defaultValue: filters.assignedToId?.toString().split(',') ?? [],
      options: agents.map((agent) => ({
        value: agent.id,
        label: agent.name || '-',
      })),
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('assignedToId', value.join(','));
        }
      },
    });
  }

  return (
    <DataTable
      isLoading={isLoading}
      columns={columns}
      data={initialData?.items ?? []}
      filters={localFilters}
      totalCount={initialData?.total ?? 0}
      pageIndex={filters?.page}
      pageSize={Number(filters?.limit || 10)}
      onPageChange={handlePageChange}
      onLimitChange={handleLimitChange}
      hiddenColumns={['id', 'priority', 'assignedTo']}
      onRefresh={onRefresh}
    />
  );
}
