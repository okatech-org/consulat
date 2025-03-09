'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions';
import { Trash } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { FilterOption } from '@/components/data-table/data-table-toolbar';
import { BaseAgent, FullOrganization } from '@/types/organization';
import { Country, ServiceCategory } from '@prisma/client';
import { RoleGuard } from '@/lib/permissions/utils';
import { CollapseList } from '../ui/collapse-list';

interface UsersTableProps {
  agents: FullOrganization['agents'];
  countries: Country[];
}

export function UsersTable({ agents, countries }: UsersTableProps) {
  const t = useTranslations('organization.settings.agents');
  const t_base = useTranslations();

  const columns: ColumnDef<BaseAgent>[] = [
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
            t_base('common.status.NOT_ASSIGNED')}
        </div>
      ),
    },
    {
      accessorKey: 'specializations',
      header: () => <>{t('table.specializations')}</>,
      cell: ({ row }) => (
        <CollapseList<ServiceCategory>
          items={row.original.specializations}
          renderItem={(cat) => (
            <Badge variant="secondary" className="rounded-full !px-0.5 font-normal">
              {t_base(`services.categories.${cat}`)}
            </Badge>
          )}
        />
      ),
    },
    {
      id: 'actions',
      header: t_base('common.data_table.actions'),
      cell: ({ row }) => (
        <RoleGuard roles={['SUPER_ADMIN', 'ADMIN']}>
          <DataTableRowActions<BaseAgent>
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
                  console.log("Supprimer l'agent", row);
                },
              },
            ]}
            row={row}
          />
        </RoleGuard>
      ),
    },
  ];

  const localFilters: FilterOption<BaseAgent>[] = [
    {
      type: 'search',
      property: 'firstName',
      label: t('table.firstName'),
    },
    {
      type: 'checkbox',
      property: 'specializations',
      label: t('table.specializations'),
      options: Object.values(ServiceCategory).map((category) => ({
        label: t_base(`services.categories.${category}`),
        value: category,
      })),
    },
    {
      type: 'checkbox',
      property: 'linkedCountries',
      label: t('table.countries'),
      options: countries.map((country) => ({
        label: country.name,
        value: country.id,
      })),
    },
  ];

  return (
    <DataTable<BaseAgent, unknown>
      filters={localFilters}
      columns={columns}
      data={agents}
    />
  );
}
