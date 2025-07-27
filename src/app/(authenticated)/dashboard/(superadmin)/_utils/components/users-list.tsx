'use client';

import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Eye, Users, UserCheck } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useMemo } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { api } from '@/trpc/react';
import { useTableSearchParams } from '@/hooks/use-table-search-params';
import type { FilterOption } from '@/components/data-table/data-table-toolbar';
import type { UserListItem } from '@/server/api/routers/users/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useDateLocale } from '@/lib/utils';
import { UserRole } from '@prisma/client';

// Types pour les filtres d'utilisateurs
interface UsersFilters {
  search?: string;
  roles?: UserRole[];
  countryCode?: string[];
  organizationId?: string[];
  hasProfile?: boolean;
}

// Function to adapt search parameters for users
function adaptSearchParams(searchParams: URLSearchParams): UsersFilters {
  return {
    search: searchParams.get('search') || undefined,
    roles: searchParams.get('roles')?.split(',').filter(Boolean) as
      | UserRole[]
      | undefined,
    countryCode: searchParams.get('countryCode')?.split(',').filter(Boolean) || undefined,
    organizationId:
      searchParams.get('organizationId')?.split(',').filter(Boolean) || undefined,
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

  const { formatDate } = useDateLocale();

  const {
    data: result,
    isLoading,
    refetch,
  } = api.user.getList.useQuery({
    ...params,
    page: pagination.page,
    limit: pagination.limit,
    sortBy: sorting.field as string,
    sortOrder: sorting.order,
  });

  const users = result?.items || [];
  const total = result?.total || 0;

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
                    navigator.clipboard.writeText(row.original.id);
                    toast.success('ID copié dans le presse-papiers');
                  }}
                >
                  <span className="uppercase text-xs">
                    {row.original.id.slice(0, 6)}...
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <span className="uppercase">{row.original.id}</span> (cliquez pour copier)
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
        accessorKey: 'role',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('table.role')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'role' as keyof UserListItem,
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
          const role = row.original.role;
          const variant =
            role === 'SUPER_ADMIN'
              ? 'destructive'
              : role === 'ADMIN'
                ? 'default'
                : role === 'MANAGER'
                  ? 'secondary'
                  : role === 'AGENT'
                    ? 'outline'
                    : 'warning';

          return (
            <Badge variant={variant}>
              {t(`form.role.options.${role.toLowerCase()}`)}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: 'country',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.country')} />
        ),
        cell: ({ row }) => {
          const country = row.original.country;
          return country ? (
            <div className="flex items-center space-x-2">
              <img
                src={`https://flagcdn.com/${country.code.toLowerCase()}.svg`}
                alt={country.name}
                className="w-4 h-3 rounded object-cover"
              />
              <span className="text-sm">{country.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: 'assignedOrganization',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.organization')} />
        ),
        cell: ({ row }) => {
          const org = row.original.assignedOrganization;
          return org ? (
            <Badge variant="outline">{org.name}</Badge>
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
              <span className="text-sm text-green-600">
                {profile.cardNumber || 'Profil existant'}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('table.createdAt')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'createdAt' as keyof UserListItem,
                order: direction,
              })
            }
          />
        ),
        cell: ({ row }) => {
          const date = row.original.createdAt;
          return <span className="text-sm">{formatDate(date, 'dd/MM/yyyy')}</span>;
        },
      },
      {
        accessorKey: '_count',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.requests')} />
        ),
        cell: ({ row }) => {
          const count = row.original._count;
          return (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span className="text-xs">{count.submittedRequests}</span>
              </div>
              {count.assignedRequests > 0 && (
                <div className="flex items-center space-x-1">
                  <UserCheck className="h-3 w-3" />
                  <span className="text-xs">{count.assignedRequests}</span>
                </div>
              )}
            </div>
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
                  href={ROUTES.sa.user_details(row.original.id)}
                >
                  <Eye className="size-icon" />
                  <span className="sr-only">Voir détails</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <span>Voir les détails</span>
              </TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    [t, handleSortingChange, formatDate],
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
        label: t('table.role'),
        options: Object.values(UserRole).map((role) => ({
          value: role,
          label: t(`form.role.options.${role.toLowerCase()}`),
        })),
        defaultValue: params.roles || [],
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange('roles', value);
          }
        },
      },
    ],
    [t, params, handleParamsChange],
  );

  // Calcul des statistiques
  const stats = useMemo(() => {
    const totalUsers = total;
    const withProfile = users.filter((user) => user.profile).length;
    const byRole = Object.values(UserRole).reduce(
      (acc, role) => {
        acc[role] = users.filter((user) => user.role === role).length;
        return acc;
      },
      {} as Record<UserRole, number>,
    );

    return {
      totalUsers,
      withProfile,
      withoutProfile: users.length - withProfile,
      byRole,
    };
  }, [users, total]);

  return (
    <>
      {stats && (
        <div className="mb-4 text-sm text-muted-foreground">
          {stats.totalUsers} utilisateurs • {stats.withProfile} avec profil •
          {stats.withoutProfile} sans profil
        </div>
      )}
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
        onRefresh={refetch}
        activeSorting={[sorting.field, sorting.order]}
        hiddenColumns={['_count']}
      />
    </>
  );
}
