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
import { ServiceCategory, ServicePriority } from '@prisma/client';
import { hasAnyRole } from '@/lib/permissions/utils';
import { User } from '@prisma/client';
import { RequestQuickEditFormDialog } from './request-quick-edit-form-dialog';

interface RequestsTableProps {
  user: User;
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

  const handleFilterChange = (name: string, value: string | undefined) => {
    const newQueryString = createQueryString(name, value);
    router.push(`${pathname}?${newQueryString}`);
  };

  const columns: ColumnDef<FullServiceRequest>[] = [
    {
      accessorKey: 'submittedAt',
      header: () => t('dashboard.requests.table.submitted_at'),
      enableSorting: true,
      cell: ({ row }) => {
        const date = row.original.submittedAt;
        return date ? formatDate(date, 'dd/MM/yyyy') : '-';
      },
    },
    {
      accessorKey: 'fullName',
      enableSorting: true,
      filterFn: 'auto',
      header: () => t('inputs.fullName.label'),
      cell: ({ row }) => {
        const fullName =
          row.original.submittedBy.firstName + ' ' + row.original.submittedBy.lastName;
        return fullName;
      },
    },
    {
      accessorKey: 'submittedBy.email',
      header: () => t('inputs.email.label'),
    },
    {
      accessorKey: 'status',
      header: () => t('inputs.status.label'),
      enableSorting: true,
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'SUBMITTED' ? 'outline' : 'default'}>
          {t('common.status.' + row.original.status.toLowerCase())}
        </Badge>
      ),
    },
    {
      accessorKey: 'priority',
      header: () => t('dashboard.requests.table.priority'),
      enableSorting: true,
      sortingFn: (a, b) => {
        return a.original.priority.localeCompare(b.original.priority);
      },
      cell: ({ row }) => (
        <Badge variant={row.original.priority === 'URGENT' ? 'destructive' : 'outline'}>
          {t('common.priority.' + row.original.priority.toLowerCase())}
        </Badge>
      ),
    },
    {
      accessorKey: 'serviceCategory',
      header: () => t('inputs.serviceCategory.label'),
      enableSorting: true,
      filterFn: 'arrIncludesSome',
      cell: ({ row }) => (
        <Badge variant={'outline'}>
          {t('common.service_categories.' + row.original.serviceCategory)}
        </Badge>
      ),
    },
  ];

  const isAdmin = hasAnyRole(user, ['ADMIN', 'MANAGER']);

  if (isAdmin) {
    columns.push({
      accessorKey: 'assignedTo',
      header: () => t('dashboard.requests.table.assigned_to'),
      cell: ({ row }) => {
        const assignedTo = row.original.assignedTo;
        return assignedTo ? assignedTo.firstName + ' ' + assignedTo.lastName : '-';
      },
      enableSorting: true,
      filterFn: 'auto',
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
                {t('common.actions.view')}
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
      property: 'submittedBy_email',
      label: t('dashboard.requests.filters.search'),
      defaultValue: filters.search,
      onChange: (value) => {
        if (typeof value === 'string') {
          const debouncedFilter = debounce(
            () => handleFilterChange('search', value),
            300,
          );
          debouncedFilter();
        }
      },
    },
    {
      type: 'checkbox',
      property: 'status',
      label: t('dashboard.requests.filters.status'),
      defaultValue: filters.status?.toString().split(',') ?? undefined,
      options: [
        { value: 'SUBMITTED', label: t('common.status.submitted') },
        { value: 'APPROVED', label: t('common.status.approved') },
        { value: 'REJECTED', label: t('common.status.rejected') },
        { value: 'VALIDATED', label: t('common.status.validated') },
        { value: 'PENDING', label: t('common.status.pending') },
        { value: 'COMPLETED', label: t('common.status.completed') },
        { value: 'CANCELLED', label: t('common.status.cancelled') },
      ],
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('status', value.join('_'));
        }
      },
    },
    {
      type: 'checkbox',
      property: 'priority',
      label: t('dashboard.requests.filters.priority'),
      defaultValue: filters.priority?.toString().split(',') ?? undefined,
      options: Object.values(ServicePriority).map((priority) => ({
        value: priority,
        label: t('common.priority.' + priority.toLowerCase()),
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
      label: t('dashboard.requests.filters.service_category'),
      defaultValue: filters.serviceCategory?.toString().split(',') ?? undefined,
      options: availableServiceCategories.map((category) => ({
        value: category,
        label: t('common.service_categories.' + category),
      })),
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('serviceCategory', value.join('_'));
        }
      },
      isDisabled: !hasAnyRole(user, ['ADMIN', 'MANAGER']),
    },
  ];

  if (isAdmin && agents) {
    localFilters.push({
      type: 'checkbox',
      property: 'assignedTo',
      label: t('dashboard.requests.filters.assigned_to'),
      defaultValue: filters.assignedToId?.toString().split(',') ?? undefined,
      options: agents.map((agent) => ({
        value: agent.id,
        label: agent.firstName + ' ' + agent.lastName,
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
