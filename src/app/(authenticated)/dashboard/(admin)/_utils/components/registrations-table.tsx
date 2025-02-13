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
import { RegistrationListingItem } from '@/types/consular-service';
import { DisplayDate } from '@/lib/utils';
import { getRegistrations, GetRegistrationsOptions } from '@/actions/registrations';
import { useSearchParams } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';
import { FilterOption } from '@/components/data-table/data-table-toolbar';
import { ProfileStatusBadge } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-status-badge';
interface RegistrationsTableProps {
  requests?: RegistrationListingItem[];
  filters: GetRegistrationsOptions;
  totalCount?: number;
}

export function RegistrationsTable({
  requests = [],
  filters,
  totalCount = 0,
}: RegistrationsTableProps) {
  const t = useTranslations('admin.registrations');
  const t_auth = useTranslations('auth');
  const t_common = useTranslations('common');

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = React.useState(false);
  const [items, setItems] = React.useState<RegistrationListingItem[]>(requests);
  const [itemsTotalCount, setItemsTotalCount] = React.useState(totalCount);

  React.useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      const { requests, total } = await getRegistrations(filters);
      setItems(requests);
      setItemsTotalCount(total);
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

  const columns: ColumnDef<RegistrationListingItem>[] = [
    {
      accessorKey: 'submittedAt',
      header: () => t('table.submitted_at'),
      cell: ({ row }) => {
        const date = row.original.submittedAt;
        return date ? DisplayDate(date) : '-';
      },
    },
    {
      accessorKey: 'submittedBy.lastName',
      header: () => t('table.last_name'),
    },
    {
      accessorKey: 'submittedBy.firstName',
      header: () => t('table.first_name'),
    },
    {
      accessorKey: 'submittedBy.email',
      header: () => t_auth('labels.email'),
    },
    {
      accessorKey: 'submittedBy.phone',
      header: () => t('fields.phone'),
      cell: ({ row }) => row.original.submittedBy.phone?.number ?? '-',
    },
    {
      accessorKey: 'status',
      header: () => t('table.status'),
      cell: ({ row }) => (
        <Badge>{t('status.' + row.original.status.toLowerCase())}</Badge>
      ),
    },
    {
      accessorKey: 'submittedBy.profile.status',
      header: () => t('fields.profileStatus') as string,
      cell: ({ row }) => (
        <ProfileStatusBadge status={row.original.submittedBy.profile?.status} />
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          actions={[
            {
              component: (
                <Link
                  onClick={(e) => e.stopPropagation()}
                  href={ROUTES.admin.registrations_review(row.original.id)}
                >
                  <FileText className="mr-2 size-4" />
                  {t('actions.review')}
                </Link>
              ),
            },
          ]}
          row={row}
        />
      ),
    },
  ];

  const localFilters: FilterOption<RegistrationListingItem>[] = [
    {
      type: 'search',
      property: 'submittedBy_email',
      label: t('filters.search'),
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
      label: t('filters.status'),
      defaultValue: filters.status?.toString().split(',') ?? undefined,
      options: [
        { value: 'SUBMITTED', label: t_common('status.submitted') },
        { value: 'APPROVED', label: t_common('status.approved') },
        { value: 'REJECTED', label: t_common('status.rejected') },
        { value: 'VALIDATED', label: t_common('status.validated') },
      ],
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('status', value.join('_'));
        }
      },
    },
    {
      type: 'checkbox',
      property: 'submittedBy_profile_status',
      label: t('filters.profile_status'),
      defaultValue: filters.profileStatus?.toString().split(',') ?? undefined,
      options: [
        { value: 'DRAFT', label: t_common('status.draft') },
        { value: 'SUBMITTED', label: t_common('status.submitted') },
        { value: 'IN_REVIEW', label: t_common('status.in_review') },
        { value: 'VALIDATED', label: t_common('status.validated') },
        { value: 'REJECTED', label: t_common('status.rejected') },
      ],
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('profileStatus', value.join('_'));
        }
      },
    },
  ];

  return (
    <DataTable
      isLoading={isLoading}
      columns={columns}
      data={items}
      filters={localFilters}
      pageCount={itemsTotalCount}
    />
  );
}
