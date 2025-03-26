'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import { FileText } from 'lucide-react';
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { useSearchParams } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { FilterOption } from '@/components/data-table/data-table-toolbar';
import {
  Country,
  Gender,
  MaritalStatus,
  ProfileCategory,
  RequestStatus,
  WorkStatus,
} from '@prisma/client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { format as formatDate } from 'date-fns';
import { getProfiles, GetProfilesOptions, PaginatedProfiles } from '@/actions/profiles';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { CountryCode } from '@/lib/autocomplete-datas';
import { ROUTES } from '@/schemas/routes';

interface ProfilesTableProps {
  filters: GetProfilesOptions;
  countries: Country[];
}

export function ProfilesTable({ filters, countries }: ProfilesTableProps) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PaginatedProfiles | null>(null);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset page when filter changes
    if (key !== 'page') {
      params.set('page', '1');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await getProfiles(filters);
      setResult(data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setResult({ items: [], total: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const statuses = Object.values(RequestStatus).map((status) => ({
    value: status,
    label: t(`inputs.requestStatus.options.${status}`),
  }));

  const categories = Object.values(ProfileCategory).map((category) => ({
    value: category,
    label: t(`inputs.profileCategory.options.${category}`),
  }));

  const genders = Object.values(Gender).map((gender) => ({
    value: gender,
    label: t(`inputs.gender.options.${gender}`),
  }));

  const maritalStatuses = Object.values(MaritalStatus).map((status) => ({
    value: status,
    label: t(`inputs.maritalStatus.options.${status}`),
  }));

  const workStatuses = Object.values(WorkStatus).map((status) => ({
    value: status,
    label: t(`inputs.workStatus.options.${status}`),
  }));

  const processedData: (PaginatedProfiles['items'][number] & {
    identityPictureUrl?: string;
    fullName?: string;
  })[] = React.useMemo(() => {
    if (!result?.items) return [];

    return result.items.map((item) => ({
      ...item,
      identityPictureUrl: item.identityPicture?.fileUrl || '',
      fullName: `${item.firstName} ${item.lastName}`.trim(),
    }));
  }, [result?.items]);

  const columns: ColumnDef<
    PaginatedProfiles['items'][number] & {
      identityPictureUrl?: string;
      fullName?: string;
    }
  >[] = [
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
      accessorKey: 'cardNumber',
      header: ({ column }) => <DataTableColumnHeader column={column} title={'ID'} />,
      cell: ({ row }) => <div>{row.getValue('cardNumber') || '-'}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'identityPictureUrl',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Photo d'identité" />
      ),
      cell: ({ row }) => {
        const url = row.getValue('identityPictureUrl') as string;
        return url ? (
          <Avatar>
            <AvatarImage src={url} />
          </Avatar>
        ) : (
          '-'
        );
      },
    },
    {
      accessorKey: 'fullName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.fullName.label')} />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[250px] truncate font-medium">
              {row.original.fullName || '-'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('inputs.profileCategory.label')}
        />
      ),
      cell: ({ row }) => {
        const category = categories.find((cat) => cat.value === row.getValue('category'));

        if (!category) {
          return null;
        }

        return (
          <div className="flex items-center">
            <Badge variant={'outline'}>{category.label}</Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.status.label')} />
      ),
      cell: ({ row }) => {
        const status = statuses.find((status) => status.value === row.getValue('status'));

        if (!status) {
          return null;
        }

        return (
          <div className="flex min-w-max items-center">
            <Badge variant={'outline'}>{status.label}</Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.email.label')} />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <span className="max-w-[200px] truncate">{row.getValue('email') || '-'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'cardPin',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.cardPin.label')} />
      ),
    },
    {
      accessorKey: 'gender',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.gender.label')} />
      ),
      cell: ({ row }) => {
        const gender = genders.find((g) => g.value === row.getValue('gender'));
        return gender ? <Badge variant={'outline'}>{gender.label}</Badge> : '-';
      },
    },
    {
      accessorKey: 'maritalStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.maritalStatus.label')} />
      ),
      cell: ({ row }) => {
        const status = maritalStatuses.find(
          (s) => s.value === row.getValue('maritalStatus'),
        );
        return status ? <Badge variant={'outline'}>{status.label}</Badge> : '-';
      },
    },
    {
      accessorKey: 'workStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.workStatus.label')} />
      ),
      cell: ({ row }) => {
        const status = workStatuses.find((s) => s.value === row.getValue('workStatus'));
        return status ? <Badge variant={'outline'}>{status.label}</Badge> : '-';
      },
    },
    {
      accessorKey: 'cardIssuedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.cardIssuedAt.label')} />
      ),
      cell: ({ row }) => {
        const date = row.original.cardIssuedAt;
        return date ? formatDate(date, 'dd/MM/yyyy') : '-';
      },
    },
    {
      accessorKey: 'cardExpiresAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.cardExpiresAt.label')} />
      ),
      cell: ({ row }) => {
        const date = row.original.cardExpiresAt;
        return date ? formatDate(date, 'dd/MM/yyyy') : '-';
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.createdAt.label')} />
      ),
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return date ? formatDate(date, 'dd/MM/yyyy') : '-';
      },
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
                  href={ROUTES.listing.profile(row.original.id)}
                >
                  <FileText className="mr-1 size-icon" />
                  {t('common.actions.consult')}
                </Link>
              ),
            },
          ]}
          row={row}
        />
      ),
    },
  ];

  const localFilters: FilterOption<PaginatedProfiles['items'][number]>[] = [
    {
      type: 'search',
      label: t('common.data_table.search'),
      defaultValue: filters.search ?? '',
      onChange: (value) => handleFilterChange('search', value),
    },
    {
      type: 'checkbox',
      property: 'residenceCountyCode',
      label: t('inputs.residenceCountyCode.label'),
      defaultValue: filters.residenceCountyCode?.toString().split(',') ?? [],
      options: countries.map((country) => ({
        value: country.code,
        label: t(`countries.${country.code as CountryCode}`),
      })),
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('residenceCountyCode', value.join('_'));
        }
      },
    },
    {
      type: 'checkbox',
      property: 'status',
      label: t('inputs.status.label'),
      defaultValue: filters.status?.toString().split(',') ?? [],
      options: statuses,
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('status', value.join('_'));
        }
      },
    },
    {
      type: 'checkbox',
      property: 'category',
      label: t('inputs.profileCategory.label'),
      defaultValue: filters.category?.toString().split(',') ?? [],
      options: categories,
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('category', value.join('_'));
        }
      },
    },
    {
      type: 'checkbox',
      property: 'gender',
      label: t('inputs.gender.label'),
      defaultValue: filters.gender?.toString().split(',') ?? [],
      options: genders,
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('gender', value.join('_'));
        }
      },
    },
    {
      type: 'checkbox',
      property: 'maritalStatus',
      label: t('inputs.maritalStatus.label'),
      defaultValue: filters.maritalStatus?.toString().split(',') ?? [],
      options: maritalStatuses,
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('maritalStatus', value.join('_'));
        }
      },
    },
    {
      type: 'checkbox',
      property: 'workStatus',
      label: t('inputs.workStatus.label'),
      defaultValue: filters.workStatus?.toString().split(',') ?? [],
      options: workStatuses,
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('workStatus', value.join('_'));
        }
      },
    },
  ];

  return (
    <DataTable
      isLoading={isLoading}
      columns={columns}
      data={processedData}
      filters={localFilters}
      totalCount={result?.total ?? 0}
      pageIndex={filters?.page}
      pageSize={filters?.limit}
      onPageChange={(page) => {
        handleFilterChange('page', page.toString());
      }}
      onLimitChange={(limit) => {
        handleFilterChange('limit', limit.toString());
      }}
      enableExport={true}
      exportSelectedOnly={true}
      exportFilename="profiles"
      hiddenColumns={[
        'cardPin',
        'cardIssuedAt',
        'cardExpiresAt',
        'maritalStatus',
        'workStatus',
        'email',
      ]}
    />
  );
}
