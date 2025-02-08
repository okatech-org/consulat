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
import { ProfileStatusBadge } from '@/app/(authenticated)/user/profile/_utils/components/profile-status-badge';
import { RegistrationListingItem } from '@/types/consular-service';
import { formatDefaultDate } from '@/lib/utils';
import { GetRegistrationsOptions } from '@/actions/registrations';
import { useSearchParams } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';
import { FilterOption } from '@/components/data-table/data-table-toolbar';
interface RegistrationsTableProps {
  requests: RegistrationListingItem[];
  total: number;
  filters: GetRegistrationsOptions;
}


export function RegistrationsTable({ requests, total, filters }: RegistrationsTableProps) {
  const t = useTranslations('admin.registrations');
  const t_auth = useTranslations('auth');
  const t_common = useTranslations('common');

  console.log(filters);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
      [searchParams]
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
        return date ? formatDefaultDate(date) : '-';
      },
    },
    {
      accessorKey: 'fullName',
      header: () => t('table.name'),
      cell: ({ row }) =>
        `${row.original.submittedBy.firstName || ''} ${row.original.submittedBy.lastName || ''}`,
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

  const localFilters: FilterOption[] = [
    {
      type: 'search',
      property: 'submittedBy_email',
      label: t('filters.search'),
      defaultValue: filters.search,
      onChange: (value) => {
        if (typeof value === 'string' && value.length > 2) {
          const debouncedFilter = debounce(() => handleFilterChange('search', value), 1000);
          debouncedFilter();
        }
      },
    },
    {
      type: 'checkbox',
      property: 'status',
      label: t('filters.status'),
      defaultValue: filters.status?.toString().split(",") ?? undefined,
      options: [
        { value: 'SUBMITTED', label: t_common('status.submitted') },
        { value: 'APPROVED', label: t_common('status.approved') },
        { value: 'REJECTED', label: t_common('status.rejected') },
        { value: 'VALIDATED', label: t_common('status.validated') },
      ],
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('status', value.join("_"));
        }
      },
    },
    {
      type: 'checkbox',
      property: 'submittedBy_profile_status',
      label: t('filters.profile_status'),
      defaultValue: filters.profileStatus?.toString().split(",") ?? undefined,
      options: [
        { value: 'DRAFT', label: t_common('status.draft') },
        { value: 'SUBMITTED', label: t_common('status.submitted') },
        { value: 'IN_REVIEW', label: t_common('status.in_review') },
        { value: 'VALIDATED', label: t_common('status.validated') },
        { value: 'REJECTED', label: t_common('status.rejected') },
      ],
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('profileStatus', value.join("_"));
        }
      },
    },
  ];

  return <DataTable columns={columns} data={requests} filters={localFilters} pageCount={total}/>;
}
