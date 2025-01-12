'use client'

import { Organization } from '@/types/organization'
import { DataTable } from '@/components/ui/data-table'
import { useTranslations } from 'next-intl'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { OrganizationActions } from './organization-actions'

export function OrganizationsTable({
                                     organizations
                                   }: {
  organizations: Organization[]
}) {
  const t = useTranslations('superadmin.organizations')

  const columns: ColumnDef<Organization>[] = [
    {
      accessorKey: 'name',
      header: t('table.name'),
    },
    {
      accessorKey: 'type',
      header: t('table.type'),
      cell: ({ row }) => t(`types.${row.original.type}`),
    },
    {
      accessorKey: 'countries',
      header: t('table.country'),
      cell: ({ row }) => row.original.countries.map((country) => country.name).join(', '),
    },
    {
      accessorKey: 'status',
      header: t('table.status'),
      cell: ({ row }) => (
        <Badge variant={
          row.original.status === 'ACTIVE' ? 'success' :
            row.original.status === 'INACTIVE' ? 'secondary' :
              'destructive'
        }>
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
      cell: ({ row }) => <OrganizationActions organization={row.original} />,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={organizations}
    />
  )
}