'use client'

import { Organization } from '@/types/organization'
import { useTranslations } from 'next-intl'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { OrganizationActions } from './organization-actions'
import { DataTable } from '@/components/data-table/data-table'
import { Country } from '@/types/country'
import { OrganizationStatus, OrganizationType } from '@prisma/client'

export function OrganizationsTable({
                                     organizations,
  countries
                                   }: {
  organizations: Organization[],
  countries: Country[]
}) {
  const t = useTranslations('superadmin.organizations')

  const columns: ColumnDef<Organization>[] = [
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
      cell: ({ row }) => row.original.countries.map((country) => (
        <Badge className={"mr-1"} key={country.code} variant="secondary">
          {country.name}
        </Badge>
      )),
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
      filters={[
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
      ]}
      columns={columns}
      data={organizations}
    />
  )
}