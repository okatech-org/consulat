'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions';
import { Trash } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { BaseAgent, FullOrganization } from '@/types/organization';
import { Country, ServiceCategory } from '@prisma/client';
import { RoleGuard } from '@/lib/permissions/utils';
import { CollapseList } from '../ui/collapse-list';

interface UsersTableProps {
  agents: FullOrganization['agents'];
  countries: Country[];
}

export function UsersTable({ agents }: UsersTableProps) {
  const t = useTranslations('organization.settings.agents');
  const t_base = useTranslations();

  const columns: ColumnDef<BaseAgent>[] = [
    {
      header: t('table.name'),
      accessorKey: 'name',
      cell: ({ row }) => row.original.name || '-',
    },
    {
      header: t('table.email'),
      accessorKey: 'email',
      cell: ({ row }) => row.original.email || '-',
    },
    {
      header: t('table.phone'),
      accessorKey: 'phoneNumber',
      cell: ({ row }) => (row.original.phoneNumber ? `${row.original.phoneNumber}` : '-'),
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
      accessorKey: 'assignedServices',
      header: () => <>{t('table.specializations')}</>,
      cell: ({ row }) => (
        <CollapseList<{ id: string; name: string; category: ServiceCategory }>
          items={row.original.assignedServices || []}
          renderItem={(service) => (
            <Badge variant="secondary" className="rounded-full !px-0.5 font-normal">
              {service.name}
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

  return <DataTable<BaseAgent, unknown> columns={columns} data={agents} />;
}
