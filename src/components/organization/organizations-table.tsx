'use client';

import type { OrganizationListingItem } from '@/types/organization';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { OrganizationStatus, OrganizationType } from '@prisma/client';
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { Ban, CheckCircle, Pencil, Trash } from 'lucide-react';
import type { FilterOption } from '@/components/data-table/data-table-toolbar';
import { useOrganizationActions } from '@/hooks/use-organization-actions';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useState } from 'react';
import { DataTableColumnHeader } from '../data-table/data-table-column-header';
import { useSuperAdminData } from '@/hooks/use-role-data';

export function OrganizationsTable() {
  const { organizations, countries, superAdminStats } = useSuperAdminData();

  const t = useTranslations('organization');
  const t_common = useTranslations('common');
  const { handleDelete, handleStatusChange } = useOrganizationActions();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOrganization, setSelectedOrganization] =
    useState<OrganizationListingItem | null>(null);

  const columns: ColumnDef<OrganizationListingItem>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.name')} />
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.type')} />
      ),
      cell: ({ row }) => t(`types.${row.original.type}`),
    },
    {
      accessorKey: 'countries',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.country')} />
      ),
      cell: ({ row }) =>
        row.original.countries.map((country) => (
          <Badge className={'mr-1'} key={country.code} variant="outline">
            {country.name}
          </Badge>
        )),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.status')} />
      ),
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === 'ACTIVE'
              ? 'default'
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.services')} />
      ),
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
                  href={ROUTES.dashboard.edit_organization(row.original.id)}
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

  const localFilters: FilterOption<OrganizationListingItem>[] = [
    {
      type: 'search',
      property: 'name',
      label: t('table.name'),
      defaultValue: '',
      onChange: () => {},
    },
    {
      type: 'checkbox',
      property: 'status',
      label: t('table.status'),
      defaultValue: [],
      onChange: () => {},
      options: [
        {
          value: OrganizationStatus.ACTIVE,
          label: t_common(`status.${OrganizationStatus.ACTIVE}`),
        },
        {
          value: OrganizationStatus.INACTIVE,
          label: t_common(`status.${OrganizationStatus.INACTIVE}`),
        },
      ],
    },
    {
      type: 'checkbox',
      property: 'type',
      label: t('table.type'),
      defaultValue: [],
      onChange: () => {},
      options: Object.values(OrganizationType).map((type) => ({
        value: type,
        label: t_common(`organization_types.${type}`),
      })),
    },
    {
      type: 'checkbox',
      property: 'countries',
      label: t('table.country'),
      defaultValue: [],
      onChange: () => {},
      options: countries.map((country) => ({
        value: country.code,
        label: country.name,
      })),
    },
  ];

  return (
    <>
      <div className="mb-4 text-sm text-muted-foreground">
        {superAdminStats.totalOrganizations} organisations total •{' '}
        {superAdminStats.activeOrganizations} actives •{' '}
      </div>
      <DataTable<OrganizationListingItem, unknown>
        filters={localFilters}
        columns={columns}
        data={organizations}
      />{' '}
      {selectedOrganization && (
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={() => {
            handleDelete(selectedOrganization?.id);
            setShowDeleteDialog(false);
          }}
          title={t('actions.delete')}
          description={t('actions.delete_confirm')}
          variant={'destructive'}
        />
      )}
    </>
  );
}
