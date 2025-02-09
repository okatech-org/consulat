'use client';

import { OrganizationListingItem } from '@/types/organization';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { Country } from '@/types/country';
import { OrganizationStatus, OrganizationType } from '@prisma/client';
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { Ban, CheckCircle, Pencil, Trash } from 'lucide-react';
import { FilterOption } from '@/components/data-table/data-table-toolbar';
import * as React from 'react';
import { useOrganizationActions } from '@/hooks/use-organization-actions';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useState } from 'react';

export function OrganizationsTable({
  organizations,
  countries,
}: {
  organizations: OrganizationListingItem[];
  countries: Country[];
}) {
  const t = useTranslations('organization');
  const t_common = useTranslations('common');
  const { handleDelete, handleStatusChange } = useOrganizationActions();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOrganization, setSelectedOrganization] =
    useState<OrganizationListingItem | null>(null);

  const columns: ColumnDef<OrganizationListingItem>[] = [
    {
      accessorKey: 'name',
      header: t('table.name'),
      enableSorting: true,
    },
    {
      accessorKey: 'type',
      header: t('table.type'),
      cell: ({ row }) => t(`types.${row.original.type}`),
    },
    {
      accessorKey: 'countries',
      header: t('table.country'),
      cell: ({ row }) =>
        row.original.countries.map((country) => (
          <Badge className={'mr-1'} key={country.code} variant="info">
            {country.name}
          </Badge>
        )),
    },
    {
      accessorKey: 'status',
      header: t('table.status'),
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === 'ACTIVE'
              ? 'success'
              : row.original.status === 'INACTIVE'
                ? 'outline'
                : 'destructive'
          }
        >
          {t(`status.${row.original.status}`)}
        </Badge>
      ),
    },
    {
      accessorKey: 'services',
      header: t('table.services'),
      cell: ({ row }) => row.original._count?.services || 0,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions<OrganizationListingItem>
          actions={[
            {
              component: (
                <Link
                  onClick={(e) => e.stopPropagation()}
                  href={ROUTES.sa.edit_organization(row.original.id)}
                >
                  <Pencil className="mr-1 size-4" /> {t_common('actions.edit')}
                </Link>
              ),
            },
            {
              label: (
                <>
                  {row.original.status === 'ACTIVE' ? (
                    <>
                      <Ban className="mr-2 size-4" />
                      {t('actions.suspend')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 size-4" />
                      {t('actions.activate')}
                    </>
                  )}
                </>
              ),
              onClick: (row) => {
                handleStatusChange(
                  row.id,
                  row.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                );
              },
            },
            {
              label: (
                <>
                  <Trash className="mr-1 size-4 text-destructive" />
                  <span className="text-destructive"> {t_common('actions.delete')}</span>
                </>
              ),
              onClick: (row) => {
                setSelectedOrganization(row);
                setShowDeleteDialog(true);
              },
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
      value: 'name',
      label: t('table.name'),
    },
    {
      type: 'radio',
      value: 'type',
      label: t('table.type'),
      options: Object.values(OrganizationType).map((type) => ({
        value: type,
        label: t(`types.${type}`),
      })),
    },
    {
      type: 'radio',
      value: 'countries',
      label: t('table.country'),
      options: countries.map((country) => ({
        value: country.code,
        label: country.name,
      })),
    },
    {
      type: 'radio',
      value: 'status',
      label: t('table.status'),
      options: Object.values(OrganizationStatus).map((status) => ({
        value: status,
        label: t(`status.${status}`),
      })),
    },
  ];

  return (
    <>
      <DataTable<OrganizationListingItem, unknown>
        filters={localFilters}
        columns={columns}
        data={organizations}
      />{' '}
      {selectedOrganization && (
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={() => handleDelete(selectedOrganization?.id)}
          title={t('actions.delete')}
          description={t('actions.delete_confirm')}
          variant={'destructive'}
        />
      )}
    </>
  );
}
