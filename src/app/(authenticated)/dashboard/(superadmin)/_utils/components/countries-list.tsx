'use client';

import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { DataTable } from '@/components/data-table/data-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Pencil, Trash } from 'lucide-react';
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { deleteCountry } from '@/actions/countries';
import { EditCountryDialog } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/components/edit-country-dialog';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { tryCatch } from '@/lib/utils';
import { useCountries } from '@/hooks/use-countries';
import { useTableSearchParams } from '@/hooks/use-table-search-params';
import type { FilterOption } from '@/components/data-table/data-table-toolbar';
import type { CountryListItem } from '@/server/api/routers/countries/types';
import type { Country, CountryMetadata } from '@/types/country';

// Fonction pour convertir CountryListItem en Country
function countryListItemToCountry(item: CountryListItem): Country {
  return {
    id: item.id,
    name: item.name,
    code: item.code,
    status: item.status,
    flag: null,
    metadata: item.metadata
      ? ((typeof item.metadata === 'string'
          ? JSON.parse(item.metadata)
          : item.metadata) as CountryMetadata)
      : null,
    _count: item._count,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

// Types pour les filtres de pays
interface CountryFilters {
  search?: string;
  status?: Array<'ACTIVE' | 'INACTIVE'>;
}

// Function to adapt search parameters for countries
function adaptSearchParams(searchParams: URLSearchParams): CountryFilters {
  return {
    status: searchParams.get('status')?.split(',').filter(Boolean) as
      | Array<'ACTIVE' | 'INACTIVE'>
      | undefined,
    search: searchParams.get('search') || undefined,
  };
}

export function CountriesList() {
  const {
    params,
    pagination,
    sorting,
    handleParamsChange,
    handleSortingChange,
    handlePaginationChange,
  } = useTableSearchParams<CountryListItem, CountryFilters>(adaptSearchParams);

  const t = useTranslations('sa.countries');
  const t_common = useTranslations('common');
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [country, setCountry] = useState<CountryListItem | null>(null);

  const { countries, total, isLoading, refetch } = useCountries({
    ...params,
    page: pagination.page,
    limit: pagination.limit,
  });

  const handleDelete = async (country: CountryListItem) => {
    const result = await tryCatch(deleteCountry(country.id));

    if (result.error) {
      toast({
        title: t('messages.error.delete'),
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('messages.deleteSuccess'),
      });
      setShowDeleteDialog(false);
      refetch();
    }
  };

  const columns = useMemo<ColumnDef<CountryListItem>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'code',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('table.code')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'code' as keyof CountryListItem,
                order: direction,
              })
            }
            labels={{
              asc: 'A-Z',
              desc: 'Z-A',
            }}
          />
        ),
        cell: ({ row }) => <div>{row.getValue('code')}</div>,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('table.name')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'name' as keyof CountryListItem,
                order: direction,
              })
            }
            labels={{
              asc: 'A-Z',
              desc: 'Z-A',
            }}
          />
        ),
        cell: ({ row }) => {
          const name = row.getValue('name') as string;
          const code = row.getValue('code') as string;
          return (
            <div className="flex space-x-2">
              <Image
                src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
                alt={name || ''}
                width={20}
                height={15}
                className="rounded object-contain"
              />
              <span className="max-w-[500px] truncate font-medium">{name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('table.status')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'status' as keyof CountryListItem,
                order: direction,
              })
            }
            labels={{
              asc: 'A-Z',
              desc: 'Z-A',
            }}
          />
        ),
        cell: ({ row }) => {
          const status = row.getValue('status') as 'ACTIVE' | 'INACTIVE';

          if (!status) {
            return null;
          }

          return (
            <Badge variant={status === 'ACTIVE' ? 'default' : 'warning'}>
              {t(`form.status.options.${status.toLowerCase() as 'active' | 'inactive'}`)}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: '_count.organizations',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('table.organizationsCount')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: '_count' as keyof CountryListItem,
                order: direction,
              })
            }
          />
        ),
      },
      {
        accessorKey: '_count.users',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('table.usersCount')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: '_count' as keyof CountryListItem,
                order: direction,
              })
            }
          />
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
                    href={ROUTES.sa.edit_country(row.original.id)}
                  >
                    <Pencil className="mr-1 size-4" /> {t_common('actions.edit')}
                  </Link>
                ),
              },
              {
                label: (
                  <>
                    <Trash className="mr-1 size-4 text-destructive" />
                    <span className="text-destructive">
                      {' '}
                      {t_common('actions.delete')}
                    </span>
                  </>
                ),
                onClick: (row) => {
                  setCountry(row);
                  setShowDeleteDialog(true);
                },
              },
            ]}
            row={row}
          />
        ),
      },
    ],
    [t, t_common, handleSortingChange],
  );

  // Définition des filtres
  const filters = useMemo<FilterOption<CountryListItem>[]>(
    () => [
      {
        type: 'search',
        property: 'search',
        label: t('table.name'),
        defaultValue: params.search || '',
        onChange: (value: string) => handleParamsChange('search', value),
      },
      {
        type: 'checkbox',
        property: 'status',
        label: t('table.status'),
        options: [
          { value: 'ACTIVE', label: t('form.status.options.active') },
          { value: 'INACTIVE', label: t('form.status.options.inactive') },
        ],
        defaultValue: params.status || ['ACTIVE'],
        onChange: (value: string[]) => {
          if (Array.isArray(value)) {
            handleParamsChange('status', value as Array<'ACTIVE' | 'INACTIVE'>);
          }
        },
      },
    ],
    [t, params, handleParamsChange],
  );

  // Calcul des statistiques
  const stats = useMemo(() => {
    const activeCountries = countries.filter(
      (country) => country.status === 'ACTIVE',
    ).length;
    const inactiveCountries = countries.filter(
      (country) => country.status === 'INACTIVE',
    ).length;

    return {
      totalCountries: total,
      activeCountries,
      inactiveCountries,
    };
  }, [countries, total]);

  return (
    <>
      {stats && (
        <div className="mb-4 text-sm text-muted-foreground">
          {stats.totalCountries} pays total • {stats.activeCountries} actifs •{' '}
          {stats.inactiveCountries} inactifs
        </div>
      )}
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={countries}
        filters={filters}
        totalCount={total}
        pageIndex={pagination.page - 1}
        pageSize={pagination.limit}
        onPageChange={(page) => handlePaginationChange('page', page + 1)}
        onLimitChange={(limit) => handlePaginationChange('limit', limit)}
        onRefresh={refetch}
        activeSorting={[sorting.field, sorting.order]}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => handleDelete(country as CountryListItem)}
        title={t('dialogs.delete.title')}
        description={t('dialogs.delete.description')}
        variant={'destructive'}
      />

      {country && (
        <EditCountryDialog
          country={countryListItemToCountry(country)}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
    </>
  );
}
