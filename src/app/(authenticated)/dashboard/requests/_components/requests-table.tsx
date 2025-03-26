'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import { FileText } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { useDateLocale } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';
import { FilterOption } from '@/components/data-table/data-table-toolbar';
import { FullServiceRequest, PaginatedServiceRequests } from '@/types/service-request';
import { GetRequestsOptions, getServiceRequests } from '@/actions/service-requests';
import { RequestStatus, ServiceCategory, ServicePriority } from '@prisma/client';
import { hasAnyRole } from '@/lib/permissions/utils';
import { User } from '@prisma/client';
import { RequestQuickEditFormDialog } from './request-quick-edit-form-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { SessionUser } from '@/types';

interface RequestsTableProps {
  user: SessionUser;
  filters: GetRequestsOptions;
  agents?: User[];
  availableServiceCategories: ServiceCategory[];
}

export function RequestsTable({
  user,
  filters,
  agents,
  availableServiceCategories = [],
}: RequestsTableProps) {
  const t = useTranslations();
  const { formatDate } = useDateLocale();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<PaginatedServiceRequests | null>(null);

  const statuses: {
    value: RequestStatus;
    label: string;
  }[] = [
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

  React.useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      const result = await getServiceRequests(filters);
      setResult(result);
      setIsLoading(false);
    };
    fetchData().finally(() => setIsLoading(false));
  }, [filters]);

  // Créez une fonction pour mettre à jour l'URL avec les filtres
  const createQueryString = React.useCallback(
    (name: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams],
  );

  const [pendingFilters, setPendingFilters] = React.useState<
    Record<string, string | undefined>
  >({});

  React.useEffect(() => {
    // Only execute if there are pending filters to apply
    if (Object.keys(pendingFilters).length > 0) {
      // Build the complete query string from all pending filters
      let newQueryString = searchParams.toString();

      // Apply each pending filter
      for (const [name, value] of Object.entries(pendingFilters)) {
        const updatedQueryString = createQueryString(name, value);
        newQueryString = updatedQueryString;
      }

      // Navigate to the new URL
      router.push(`${pathname}?${newQueryString}`);

      // Clear pending filters after applying them
      setPendingFilters({});
    }
  }, [pendingFilters, createQueryString, pathname, router, searchParams]);

  const handleFilterChange = (name: string, value: string | undefined) => {
    // Instead of directly updating the router, queue the change
    setPendingFilters((prev) => ({ ...prev, [name]: value }));
  };

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
      accessorKey: 'fullName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.fullName.label')} />
      ),
      cell: ({ row }) => {
        const fullName = row.original.submittedBy.name;

        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">{fullName}</span>
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

  const isAdmin = hasAnyRole(user, ['ADMIN', 'MANAGER']);

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
      <DataTableRowActions
        actions={[
          {
            component: (
              <Link
                onClick={(e) => e.stopPropagation()}
                href={ROUTES.dashboard.service_requests(row.original.id)}
              >
                <FileText className="mr-1 size-icon" />
                {t('common.actions.consult')}
              </Link>
            ),
          },
          {
            component: hasAnyRole(user, ['ADMIN', 'MANAGER']) ? (
              <RequestQuickEditFormDialog
                agents={agents as User[]}
                request={row.original}
              />
            ) : undefined,
          },
        ]}
        row={row}
      />
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
      property: 'status',
      label: t('requests.filters.status'),
      defaultValue: filters.status?.toString().split(',') ?? [],
      options: statuses,
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('status', value.join('_'));
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
          handleFilterChange('priority', value.join('_'));
        }
      },
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
          handleFilterChange('serviceCategory', value.join('_'));
        }
      },
      isDisabled: !hasAnyRole(user, ['ADMIN', 'MANAGER', 'AGENT', 'SUPER_ADMIN']),
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
          handleFilterChange('assignedToId', value.join('_'));
        }
      },
    });
  }

  return (
    <DataTable
      isLoading={isLoading}
      columns={columns}
      data={result?.items ?? []}
      filters={localFilters}
      totalCount={result?.total ?? 0}
      pageIndex={filters?.page}
      pageSize={filters?.limit}
      onPageChange={(page) => {
        handleFilterChange('page', page.toString());
      }}
      onLimitChange={(limit) => {
        handleFilterChange('limit', limit.toString());
      }}
    />
  );
}
