'use client';

import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import { FileText } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { ProfileStatusBadge } from '@/app/(authenticated)/user/profile/_utils/components/profile-status-badge';
import { FilterOption } from '@/components/data-table/data-table-toolbar';
import { RegistrationListingItem } from '@/types/consular-service';

interface RegistrationsTableProps {
  requests: RegistrationListingItem[];
}

export function RegistrationsTable({ requests }: RegistrationsTableProps) {
  const t = useTranslations('admin.registrations');
  const t_auth = useTranslations('auth');

  const columns: ColumnDef<RegistrationListingItem>[] = [
    {
      accessorKey: 'submittedBy.firstName',
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
      header: () => t('fields.profileStatus'),
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
                  Traiter
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
    { type: 'search', value: 'submittedBy.firstName', label: t('filters.search') },
    {
      type: 'radio',
      value: 'status',
      label: t('filters.status'),
      options: [
        { value: 'ALL', label: t('filters.all') },
        { value: 'SUBMITTED', label: 'Soumis' },
        { value: 'APPROVED', label: 'Approuvé' },
        { value: 'REJECTED', label: 'Rejeté' },
      ],
    },
    {
      type: 'radio',
      value: 'profileStatus',
      label: 'Profile status',
      options: [
        { value: 'ALL', label: t('filters.all') },
        { value: 'DRAFT', label: 'Brouillon' },
        { value: 'SUBMITTED', label: 'Soumis' },
        { value: 'IN_REVIEW', label: 'En cours de vérification' },
        { value: 'VALIDATED', label: 'Validé' },
        { value: 'REJECTED', label: 'Rejeté' },
      ],
    },
  ];

  return <DataTable columns={columns} data={requests} filters={localFilters} />;
}
