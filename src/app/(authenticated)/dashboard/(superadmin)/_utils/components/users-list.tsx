'use client';

import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Eye, UserCheck } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useMemo } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useTableSearchParams } from '@/hooks/use-table-search-params';
import type { FilterOption } from '@/components/data-table/data-table-toolbar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useDateLocale } from '@/lib/utils';
import { CountryCode, UserRole } from '@/convex/lib/constants';
import { useUsers, type UsersFilters } from '@/hooks/use-users';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { UserListItem } from '@/convex/lib/types';
import type { Id } from '@/convex/_generated/dataModel';

// Function to adapt search parameters for users
function adaptSearchParams(searchParams: URLSearchParams): UsersFilters {
  return {
    search: searchParams.get('search') || undefined,
    roles: searchParams.get('roles')?.split(',').filter(Boolean) as
      | UserRole[]
      | undefined,
    countryCode: searchParams.get('countryCode')?.split(',').filter(Boolean) as
      | CountryCode[]
      | undefined,
    organizationId: searchParams.get('organizationId')?.split(',').filter(Boolean) as
      | Id<'organizations'>[]
      | undefined,
    hasProfile: searchParams.get('hasProfile')
      ? searchParams.get('hasProfile') === 'true'
      : undefined,
  };
}

export function UsersList() {
  const {
    params,
    pagination,
    sorting,
    handleParamsChange,
    handleSortingChange,
    handlePaginationChange,
  } = useTableSearchParams<UserListItem, UsersFilters>(adaptSearchParams);

  const t = useTranslations('sa.users');
  const t_inputs = useTranslations('inputs');

  const { formatDate } = useDateLocale();

  // Fetch users with filters
  const { users, total, isLoading } = useUsers({
    ...params,
    page: pagination.page,
    limit: pagination.limit,
  });

  // Fetch organizations for filter
  const organizations =
    useQuery(api.functions.organization.getAllOrganizations, {}) || [];

  // Fetch countries for filter
  const countries = useQuery(api.functions.membership.getCountriesForFilter) || [];

  const columns = useMemo<ColumnDef<UserListItem>[]>(
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
          <div className="flex items-center gap-2">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="translate-y-[2px]"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    navigator.clipboard.writeText(row.original._id);
                    toast.success('ID copié dans le presse-papiers');
                  }}
                >
                  <span className="uppercase text-xs">
                    {row.original._id.slice(0, 6)}...
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <span className="uppercase">{row.original._id}</span> (cliquez pour
                copier)
              </TooltipContent>
            </Tooltip>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('table.name')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'name' as keyof UserListItem,
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
          const user = row.original;
          return (
            <div className="flex items-center space-x-2">
              <div className="flex flex-col">
                <span className="font-medium">{user.name || 'Nom non défini'}</span>
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'roles',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('table.role')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'roles' as keyof UserListItem,
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
          const roles = row.original.roles || [];
          const primaryRole = roles[0];

          if (!primaryRole) return <span className="text-muted-foreground">-</span>;

          const variant =
            primaryRole === UserRole.SuperAdmin
              ? 'destructive'
              : primaryRole === UserRole.Admin
                ? 'default'
                : primaryRole === UserRole.Manager
                  ? 'secondary'
                  : primaryRole === UserRole.Agent
                    ? 'outline'
                    : 'default';

          return (
            <Badge variant={variant as any}>
              {t(`form.role.options.${primaryRole.toLowerCase()}`)}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: 'assignedCountries',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.country')} />
        ),
        cell: ({ row }) => {
          const countryCodes = row.original.assignedCountries || [];
          if (countryCodes.length === 0) {
            return <span className="text-muted-foreground">-</span>;
          }

          const firstCountry = countries.find((c) => c.code === countryCodes[0]);

          return firstCountry ? (
            <div className="flex items-center space-x-2">
              <img
                src={`https://flagcdn.com/${firstCountry.code.toLowerCase()}.svg`}
                alt={firstCountry.name}
                className="w-4 h-3 rounded object-cover"
              />
              <span className="text-sm">{firstCountry.name}</span>
              {countryCodes.length > 1 && (
                <Badge variant="outline" className="text-xs">
                  +{countryCodes.length - 1}
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: 'organizations',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.organization')} />
        ),
        cell: ({ row }) => {
          const orgs = row.original.organizations || [];
          return orgs.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {orgs.slice(0, 2).map((org: any) => (
                <Badge key={org._id} variant="outline">
                  {org.name}
                </Badge>
              ))}
              {orgs.length > 2 && <Badge variant="outline">+{orgs.length - 2}</Badge>}
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: 'profile',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.profile')} />
        ),
        cell: ({ row }) => {
          const profile = row.original.profile;
          return profile ? (
            <div className="flex items-center space-x-1">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">Profil existant</span>
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: '_creationTime',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('table.createdAt')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: '_creationTime' as keyof UserListItem,
                order: direction,
              })
            }
          />
        ),
        cell: ({ row }) => {
          const date = row.original._creationTime;
          return (
            <span className="text-sm">{formatDate(new Date(date), 'dd/MM/yyyy')}</span>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  className={
                    buttonVariants({ variant: 'ghost', size: 'icon' }) +
                    ' aspect-square p-0'
                  }
                  href={ROUTES.dashboard.user_detail(row.original._id)}
                >
                  <Eye className="h-4 w-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Voir le détail</TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    [t, handleSortingChange, formatDate, countries],
  );

  // Définition des filtres
  const filters = useMemo<FilterOption<UserListItem>[]>(
    () => [
      {
        type: 'search',
        property: 'search',
        label: t('table.search'),
        defaultValue: params.search || '',
        onChange: (value) => handleParamsChange('search', value),
      },
      {
        type: 'checkbox',
        property: 'roles',
        label: t_inputs('userRole.label'),
        options: Object.values(UserRole).map((role) => ({
          value: role,
          label: t_inputs(`userRole.options.${role.toLowerCase()}`),
        })),
        defaultValue: params.roles || [],
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange('roles', value as unknown as UserRole[]);
          }
        },
      },
      {
        type: 'checkbox',
        property: 'countryCode',
        label: t('table.country'),
        options: countries.map((country) => ({
          value: country.code,
          label: country.name,
        })),
        defaultValue: params.countryCode || [],
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange('countryCode', value as unknown as CountryCode[]);
          }
        },
      },
      {
        type: 'checkbox',
        property: 'organizationId',
        label: t('table.organization'),
        options: organizations.map((org) => ({
          value: org._id,
          label: org.name,
        })),
        defaultValue: params.organizationId || [],
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange(
              'organizationId',
              value as unknown as Id<'organizations'>[],
            );
          }
        },
      },
      {
        type: 'checkbox',
        property: 'hasProfile',
        label: t('table.profile'),
        options: [
          { value: 'true', label: 'Avec profil' },
          { value: 'false', label: 'Sans profil' },
        ],
        defaultValue: params.hasProfile !== undefined ? [String(params.hasProfile)] : [],
        onChange: (value) => {
          if (Array.isArray(value) && value.length > 0) {
            handleParamsChange('hasProfile', value[0] === 'true');
          } else {
            handleParamsChange('hasProfile', undefined);
          }
        },
      },
    ],
    [t, params, handleParamsChange, countries, organizations],
  );

  // Calcul des statistiques
  const stats = useMemo(() => {
    const totalUsers = total;
    const withProfile = users.filter((user) => user.hasProfile).length;

    return {
      totalUsers,
      withProfile,
      withoutProfile: users.length - withProfile,
    };
  }, [users, total]);

  return (
    <>
      {stats && (
        <div className="mb-4 text-sm text-muted-foreground">
          {stats.totalUsers} utilisateurs • {stats.withProfile} avec profil •{' '}
          {stats.withoutProfile} sans profil
        </div>
      )}
      <div className="min-h-full">
        <DataTable
          isLoading={isLoading}
          columns={columns}
          data={users}
          filters={filters}
          totalCount={total}
          pageIndex={pagination.page - 1}
          pageSize={pagination.limit}
          onPageChange={(page) => handlePaginationChange('page', page + 1)}
          onLimitChange={(limit) => handlePaginationChange('limit', limit)}
          activeSorting={sorting.field ? [sorting.field, sorting.order] : undefined}
        />
      </div>
    </>
  );
}
