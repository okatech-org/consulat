'use client';

import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { OrganizationStatus, OrganizationType } from '@/convex/lib/constants';
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { Ban, CheckCircle, Pencil, Trash } from 'lucide-react';
import type { FilterOption } from '@/components/data-table/data-table-toolbar';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useState, useMemo } from 'react';
import { DataTableColumnHeader } from '../data-table/data-table-column-header';
import { useOrganizations } from '@/hooks/use-organizations';
import type { Id } from '@/convex/_generated/dataModel';
import { useTableSearchParams } from '@/hooks/use-table-search-params';
import type { OrganizationListSearchResult } from '@/convex/lib/types';
export type OrganizationListItem = OrganizationListSearchResult['organizations'][number];

interface OrganizationFilters {
  search?: string;
  type?: OrganizationType[];
  status?: OrganizationStatus[];
}

export function OrganizationsTable() {
  const t = useTranslations('sa.organizations');
  const t_inputs = useTranslations('inputs');
  const t_common = useTranslations('common');

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOrganization, setSelectedOrganization] =
    useState<OrganizationListItem | null>(null);

  // URL state management
  const {
    params: tableParams,
    pagination,
    sorting,
    handleParamsChange,
    handlePaginationChange,
    handleSortingChange,
  } = useTableSearchParams<OrganizationListItem, OrganizationFilters>((urlParams) => ({
    search: urlParams.get('search') || undefined,
    type: urlParams.get('type')?.split(',').filter(Boolean) as OrganizationType[],
    status: urlParams.get('status')?.split(',').filter(Boolean) as OrganizationStatus[],
  }));

  // Fetch data
  const { organizations, total, isLoading, updateStatus, deleteOrganization } =
    useOrganizations({
      search: tableParams.search,
      type: tableParams.type,
      status: tableParams.status,
      page: pagination.page,
      limit: pagination.limit,
    });

  const handleStatusChange = async (
    organizationId: Id<'organizations'>,
    newStatus: string,
  ) => {
    try {
      await updateStatus(organizationId, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (org: OrganizationListItem) => {
    try {
      await deleteOrganization(org._id);
      setShowDeleteDialog(false);
      setSelectedOrganization(null);
    } catch (error) {
      console.error('Error deleting organization:', error);
    }
  };

  const columns: ColumnDef<OrganizationListItem>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('table.name')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'name',
                order: direction,
              })
            }
            labels={{
              asc: 'A-Z',
              desc: 'Z-A',
            }}
          />
        ),
        enableSorting: true,
      },
      {
        accessorKey: 'type',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t_inputs('organization.type.label')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'type',
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
          return t_inputs(`organization.type.options.${row.original.type.toLowerCase()}`);
        },
      },
      {
        accessorKey: 'countries',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t_inputs('organization.country.label')}
          />
        ),
        cell: ({ row }) =>
          row.original.countries && row.original.countries.length > 0 ? (
            <div className="flex max-w-[300px] flex-wrap gap-1">
              {row.original.countries.map((country) => (
                <Badge className="mr-1" key={country?._id} variant="outline">
                  {country?.code}
                </Badge>
              ))}
            </div>
          ) : (
            '-'
          ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('table.status')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'status',
                order: direction,
              })
            }
            labels={{
              asc: 'A-Z',
              desc: 'Z-A',
            }}
          />
        ),
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === OrganizationStatus.Active
                ? 'default'
                : row.original.status === OrganizationStatus.Inactive
                  ? 'outline'
                  : 'destructive'
            }
          >
            {t_inputs(`organization.status.options.${row.original.status.toLowerCase()}`)}
          </Badge>
        ),
      },
      {
        accessorKey: '_count.services',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('table.services')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'servicesCount',
                order: direction,
              })
            }
          />
        ),
        cell: ({ row }) => row.original.servicesCount || 0,
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DataTableRowActions<OrganizationListItem>
            actions={[
              {
                component: (
                  <Link
                    onClick={(e) => e.stopPropagation()}
                    href={ROUTES.dashboard.edit_organization(row.original._id)}
                  >
                    <Pencil className="mr-1 size-4" /> {t_common('actions.edit')}
                  </Link>
                ),
              },
              {
                label: (
                  <>
                    {row.original.status === OrganizationStatus.Active ? (
                      <>
                        <Ban className="mr-2 size-4" />
                        {t('actions.suspend')}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 size-4" />
                        {t('actions.activate')}
                      </>
                    )}
                  </>
                ),
                onClick: (org) => {
                  handleStatusChange(
                    org._id,
                    org.status === OrganizationStatus.Active
                      ? OrganizationStatus.Suspended
                      : OrganizationStatus.Active,
                  );
                },
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
                  setSelectedOrganization(row);
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

  const filters: FilterOption<OrganizationListItem>[] = useMemo(
    () => [
      {
        type: 'search',
        property: 'name',
        label: t('table.name'),
        defaultValue: tableParams.search || '',
        onChange: (value: string) => handleParamsChange('search', value),
      },
      {
        type: 'checkbox',
        property: 'status',
        label: t('table.status'),
        defaultValue: (tableParams.status || []).map(String),
        onChange: (value: string[]) =>
          handleParamsChange('status', value as OrganizationStatus[]),
        options: [
          {
            value: OrganizationStatus.Active,
            label: t_inputs(
              `organization.status.options.${OrganizationStatus.Active.toLowerCase()}`,
            ),
          },
          {
            value: OrganizationStatus.Inactive,
            label: t_inputs(
              `organization.status.options.${OrganizationStatus.Inactive.toLowerCase()}`,
            ),
          },
          {
            value: OrganizationStatus.Suspended,
            label: t_inputs(
              `organization.status.options.${OrganizationStatus.Suspended.toLowerCase()}`,
            ),
          },
        ],
      },
      {
        type: 'checkbox',
        property: 'type',
        label: t('table.type'),
        defaultValue: (tableParams.type || []).map(String),
        onChange: (value: string[]) =>
          handleParamsChange('type', value as OrganizationType[]),
        options: Object.values(OrganizationType).map((type) => ({
          value: type,
          label: t_inputs(`organization.type.options.${type.toLowerCase()}`),
        })),
      },
    ],
    [t, t_inputs, tableParams, handleParamsChange],
  );

  return (
    <>
      <DataTable<
        OrganizationListItem,
        { search?: string; type?: string[]; status?: string[] }
      >
        columns={columns}
        data={organizations}
        filters={filters}
        isLoading={isLoading}
        totalCount={total}
        pageIndex={pagination.page - 1}
        pageSize={pagination.limit}
        onPageChange={(page) => handlePaginationChange('page', page + 1)}
        onLimitChange={(limit) => handlePaginationChange('limit', limit)}
        activeSorting={[sorting.field, sorting.order]}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          if (selectedOrganization) {
            void handleDelete(selectedOrganization);
          }
        }}
        title={t('dialogs.deleteOrganization.title')}
        description={t('dialogs.deleteOrganization.description')}
        variant="destructive"
      />
    </>
  );
}
