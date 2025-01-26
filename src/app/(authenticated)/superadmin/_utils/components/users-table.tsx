'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions';
import { Trash } from 'lucide-react';
import { RoleGuard } from '@/components/ui/role-guard';
import { DataTable } from '@/components/data-table/data-table';
import { FilterOption } from '@/components/data-table/data-table-toolbar';
import { OrganizationAgents } from '@/types/organization';

interface UsersTableProps {
  agents: OrganizationAgents[];
}

export function UsersTable({ agents }: UsersTableProps) {
  const t = useTranslations('organization.settings.agents');
  const t_base = useTranslations();

  const columns: ColumnDef<OrganizationAgents>[] = [
    {
      header: t('table.name'),
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    },
    {
      accessorKey: 'email',
      header: t('table.email'),
    },
    {
      accessorFn: (row) =>
        row.phone ? `${row.phone?.countryCode} ${row.phone?.number}` : '',
      header: t('table.phone'),
    },
    {
      accessorKey: 'organizationId',
      header: t('table.organization'),
      enableHiding: true,
    },
    {
      accessorKey: 'countries',
      header: () => <>{t('table.countries')}</>,
      cell: ({ row }) => (
        <div>
          {row.original.linkedCountries?.map((country) => country?.name).join(', ') ||
            t_base('common.status.not_assigned')}
        </div>
      ),
    },
    {
      accessorKey: 'serviceCategories',
      header: () => <>{t('table.service_categories')}</>, // Clé de traduction à ajouter
      cell: ({ row }) => (
        <div>
          {row.original.serviceCategories?.map((cat) => (
            <Badge className="mr-1" key={cat.toString()} variant="secondary">
              {t_base(`services.categories.${cat as any}`)}
            </Badge>
          )) || t_base('common.status.not_assigned')}
        </div>
      ),
    },
    {
      id: 'actions',
      header: t_base('common.data_table.actions'),
      cell: ({ row }) => (
        <RoleGuard roles={['SUPER_ADMIN']}>
          <DataTableRowActions<OrganizationAgents>
            actions={[
              {
                label: (
                  <>
                    <Trash className="mr-1 size-4 text-destructive" />
                    <span className="text-destructive">
                      {t_base('common.actions.delete')}
                    </span>
                  </>
                ),
                onClick: (row) => {
                  // TODO: Implement delete logic
                  console.log('Supprimer l’agent', row);
                },
              },
            ]}
            row={row}
          />
        </RoleGuard>
      ),
    },
  ];

  const localFilters: FilterOption[] = [
    {
      type: 'search',
      value: 'name',
      label: t('table.name'),
    },
  ];

  return (
    <DataTable<OrganizationAgents, unknown>
      filters={localFilters}
      columns={columns}
      data={agents}
    />
  );
}
