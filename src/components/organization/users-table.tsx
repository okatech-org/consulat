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
import { ServiceCategory } from '@prisma/client';

interface UsersTableProps {
  agents: OrganizationAgents[];
}

export function UsersTable({ agents }: UsersTableProps) {
  const t = useTranslations('organization.settings.agents');
  const t_base = useTranslations();

  const columns: ColumnDef<OrganizationAgents>[] = [
    {
      header: t('table.lastName'),
      accessorKey: 'lastName',
      cell: ({ row }) => row.original.lastName || '-',
    },
    {
      header: t('table.firstName'),
      accessorKey: 'firstName',
      cell: ({ row }) => row.original.firstName || '-',
    },
    {
      header: t('table.email'),
      accessorKey: 'email',
      cell: ({ row }) => row.original.email || '-',
    },
    {
      header: t('table.phone'),
      accessorKey: 'phone',
      cell: ({ row }) =>
        row.original.phone
          ? `${row.original.phone?.countryCode} ${row.original.phone?.number}`
          : '-',
    },
    {
      accessorKey: 'linkedCountries',
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
              {t_base(`services.categories.${cat}`)}
            </Badge>
          )) || '-'}
        </div>
      ),
    },
    {
      id: 'actions',
      header: t_base('common.data_table.actions'),
      cell: ({ row }) => (
        <RoleGuard roles={['SUPER_ADMIN', 'ADMIN']}>
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

  const localFilters: FilterOption<OrganizationAgents>[] = [
    {
      type: 'search',
      property: 'firstName',
      label: t('table.firstName'),
    },
    {
      type: 'checkbox',
      property: 'serviceCategories',
      label: t('table.service_categories'),
      options: Object.values(ServiceCategory).map((category) => ({
        label: category,
        value: category,
      })),
    },
    {
      type: 'checkbox',
      property: 'countries',
      label: t('table.countries'),
      options: Array.from(
        new Set(
          agents
            .flatMap((agent) => agent.linkedCountries)
            .filter((country): country is NonNullable<typeof country> => Boolean(country))
            .map((country) => ({
              label: country.name,
              value: country.id || '',
            })),
        ),
      ),
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
