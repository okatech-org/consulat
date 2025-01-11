'use client'

import { useTranslations } from 'next-intl'
import { Country } from '@/types/country'
import { DataTable } from '@/components/ui/data-table'
import { CountryActions } from './country-actions'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'

interface CountriesListProps {
  countries: Country[]
  isLoading?: boolean
}

export function CountriesList({ countries, isLoading }: CountriesListProps) {
  const t = useTranslations('superadmin.countries')

  const columns: ColumnDef<Country>[] = [
    {
      accessorKey: 'name',
      header: t('table.name'),
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'code',
      header: t('table.code'),
    },
    {
      accessorKey: 'status',
      header: t('table.status'),
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge
            variant={status === 'ACTIVE' ? 'success' : 'secondary'}
          >
            {t(`form.status.options.${status.toLowerCase()}`)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'consulatesCount',
      header: t('table.organizationsCount'),
    },
    {
      accessorKey: 'usersCount',
      header: t('table.usersCount'),
    },
    {
      id: 'actions',
      cell: ({ row }) => <CountryActions country={row.original} />,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={countries}
      searchKey="name"
      isLoading={isLoading}
      emptyMessage={t('table.empty')}
      loadingMessage={t('table.loading')}
    />
  )
}