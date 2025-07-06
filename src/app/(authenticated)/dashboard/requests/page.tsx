'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { useRequests, type RequestFilters } from '@/hooks/use-requests';
import { cn, useDateLocale } from '@/lib/utils';
import { PageContainer } from '@/components/layouts/page-container';
import { hasAnyRole } from '@/lib/permissions/utils';
import { RequestStatus, ServiceCategory, ServicePriority } from '@prisma/client';
import { useSession } from 'next-auth/react';

// Imports pour le DataTable
import type { ColumnDef } from '@tanstack/react-table';
import { FileText } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import type { FilterOption } from '@/components/data-table/data-table-toolbar';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTableSearchParams } from '@/hooks/use-table-search-params';
import { DialogClose } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { DataTableBulkActions } from '@/components/data-table/data-table-bulk-actions';
import {
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Sheet,
} from '@/components/ui/sheet';

// Types pour les données de la table
type ServiceRequestListItem = {
  id: string;
  status: RequestStatus;
  priority: ServicePriority;
  serviceCategory: ServiceCategory;
  createdAt: Date;
  updatedAt: Date;
  submittedBy: { id: string; email: string; name?: string } | null;
  requestedFor: {
    firstName: string;
    lastName: string;
    identityPicture?: { fileUrl: string } | null;
  } | null;
  assignedTo: { id: string; name?: string; email: string } | null;
  organization: { id: string; name: string } | null;
  country: { code: string; name: string } | null;
};

// Function to adapt search parameters for service requests
function adaptSearchParams(searchParams: URLSearchParams): RequestFilters {
  return {
    status: searchParams.get('status')?.split(',').filter(Boolean) as
      | RequestStatus[]
      | undefined,
    priority: searchParams.get('priority')?.split(',').filter(Boolean) as
      | ServicePriority[]
      | undefined,
    serviceCategory: searchParams.get('serviceCategory')?.split(',').filter(Boolean) as
      | ServiceCategory[]
      | undefined,
    organizationId: searchParams.get('organizationId')?.split(',').filter(Boolean) as
      | string[]
      | undefined,
    assignedToId: searchParams.get('assignedToId')?.split(',').filter(Boolean) as
      | string[]
      | undefined,
    search: searchParams.get('search') || undefined,
  };
}

// Schema pour les changements de statut en masse
const statusChangeSchema = z.object({
  status: z.nativeEnum(RequestStatus),
});

type StatusChangeFormData = z.infer<typeof statusChangeSchema>;

// Schema pour l'assignation en masse
const assignToSchema = z.object({
  assignedToId: z.string().min(1, 'Agent requis'),
});

type AssignToFormData = z.infer<typeof assignToSchema>;

export default function RequestsPageClient() {
  const { data: session } = useSession();
  const user = session?.user;

  const {
    params,
    pagination,
    sorting,
    handleParamsChange,
    handleSortingChange,
    handlePaginationChange,
  } = useTableSearchParams<ServiceRequestListItem, RequestFilters>(adaptSearchParams);

  const t = useTranslations();
  const { formatDate } = useDateLocale();

  // Utilisation du hook tRPC pour les demandes
  const { requests, isLoading, refetch } = useRequests({
    ...params,
    page: pagination.page,
    limit: pagination.limit,
    sortBy: sorting.field,
    sortOrder: sorting.order,
  });

  // Récupération des agents de l'organisation (temporaire - à améliorer avec un router agents)
  const agents: Array<{ id: string; name: string }> = [];

  // TODO: Remplacer par un hook tRPC dédié aux agents une fois le router agents créé
  // const { data: agents = [] } = api.agents.getByOrganization.useQuery(
  //   { organizationId: organizationId || undefined },
  //   { enabled: !!organizationId }
  // );

  // Refresh data fonction
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Définition des statuses pour les filtres
  const statuses = useMemo(
    () =>
      Object.values(RequestStatus).map((status) => ({
        value: status,
        label: t(`inputs.requestStatus.options.${status}`),
      })),
    [t],
  );

  // Définition des colonnes de la table
  const columns = useMemo<ColumnDef<ServiceRequestListItem>[]>(() => {
    const tableColumns: ColumnDef<ServiceRequestListItem>[] = [
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
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
        cell: ({ row }) => <div className="w-[80px] truncate">{row.getValue('id')}</div>,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'identityPictureUrl',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Photo" />,
        enableSorting: false,
        cell: ({ row }) => {
          const url = row.original.requestedFor?.identityPicture?.fileUrl as string;
          return url ? (
            <Avatar className="bg-muted">
              <AvatarImage src={url} />
            </Avatar>
          ) : (
            '-'
          );
        },
      },
      {
        accessorKey: 'firstName',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('inputs.firstName.label')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'firstName' as keyof ServiceRequestListItem,
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
          return (
            <div className="flex space-x-2">
              <span className="max-w-[500px] truncate font-medium">
                {row.original.requestedFor?.firstName}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'lastName',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('inputs.lastName.label')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'lastName' as keyof ServiceRequestListItem,
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
          return (
            <div className="flex space-x-2">
              <span className="max-w-[500px] truncate font-medium">
                {row.original.requestedFor?.lastName}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('requests.table.submitted_at')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'createdAt',
                order: direction,
              })
            }
          />
        ),
        cell: ({ row }) => {
          const date = row.original.createdAt;
          return date ? formatDate(date, 'dd/MM/yyyy') : '-';
        },
        enableSorting: true,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('inputs.status.label')}
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
        cell: ({ row }) => {
          const status = statuses.find(
            (status) => status.value === row.getValue('status'),
          );

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
        accessorKey: 'serviceCategory',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('inputs.serviceCategory.label')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'serviceCategory',
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
          return (
            <div className="flex items-center">
              <Badge variant={'outline'}>
                {t(`inputs.serviceCategory.options.${row.original.serviceCategory}`)}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: 'priority',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('inputs.priority.label')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'priority',
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
          return (
            <div className="flex items-center">
              <Badge
                variant={row.original.priority === 'URGENT' ? 'destructive' : 'outline'}
              >
                {t(`inputs.priority.options.${row.original.priority}`)}
              </Badge>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
    ];

    // Ajouter la colonne assignedTo si l'utilisateur est admin
    const isAdmin = user ? hasAnyRole(user, ['ADMIN', 'MANAGER', 'SUPER_ADMIN']) : false;
    if (isAdmin) {
      tableColumns.push({
        accessorKey: 'assignedToId',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('requests.table.assigned_to')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'assignedToId',
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
          const assignedTo = row.original.assignedTo;
          return assignedTo ? assignedTo.name : '-';
        },
      });
    }

    // Ajouter la colonne des actions
    tableColumns.push({
      id: 'actions',
      header: ({ table }) => (
        <DataTableBulkActions
          table={table}
          actions={[
            {
              component: (
                <StatusChangeForm
                  selectedRows={table
                    .getFilteredSelectedRowModel()
                    .flatRows.map((row) => row.original)}
                  onSuccess={() => {
                    refetch();
                  }}
                />
              ),
            },
            {
              component: (
                <AssignToChangeForm
                  selectedRows={table
                    .getFilteredSelectedRowModel()
                    .flatRows.map((row) => row.original)}
                  agents={agents as any[]}
                  onSuccess={() => {
                    refetch();
                  }}
                />
              ),
            },
          ]}
        />
      ),
      cell: ({ row }) => (
        <Button variant="outline" size="sm" className="min-w-max" asChild>
          <Link
            onClick={(e) => e.stopPropagation()}
            href={ROUTES.dashboard.service_requests(row.original.id)}
          >
            <FileText className="size-4 mr-2" />
            {t('common.actions.consult')}
          </Link>
        </Button>
      ),
    });

    return tableColumns;
  }, [t, user, formatDate, statuses, handleSortingChange, agents, refetch]);

  // Définition des filtres
  const filters = useMemo<FilterOption<any>[]>(() => {
    const isAdmin = user ? hasAnyRole(user, ['ADMIN', 'MANAGER', 'SUPER_ADMIN']) : false;

    const filterOptions: FilterOption<any>[] = [
      {
        type: 'search',
        property: 'search',
        label: t('requests.filters.search'),
        defaultValue: params.search || '',
        onChange: (value) => handleParamsChange('search', value),
      },
      {
        type: 'checkbox',
        property: 'serviceCategory',
        label: t('requests.filters.service_category'),
        defaultValue: params.serviceCategory || [],
        options: Object.values(ServiceCategory).map((category) => ({
          value: category,
          label: t(`inputs.serviceCategory.options.${category}`),
        })),
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange('serviceCategory', value);
          }
        },
      },
      {
        type: 'checkbox',
        property: 'status',
        label: t('inputs.status.label'),
        defaultValue: params.status || [],
        options: statuses,
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange('status', value);
          }
        },
      },
      {
        type: 'checkbox',
        property: 'priority',
        label: t('requests.filters.priority'),
        defaultValue: params.priority || [],
        options: Object.values(ServicePriority).map((priority) => ({
          value: priority,
          label: t(`common.priority.${priority}`),
        })),
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange('priority', value);
          }
        },
      },
    ];

    // Ajouter le filtre assignedTo si l'utilisateur est admin
    if (isAdmin && agents.length > 0) {
      filterOptions.push({
        type: 'checkbox',
        property: 'assignedToId',
        label: t('requests.filters.assigned_to'),
        defaultValue: params.assignedToId || [],
        options: agents.map((agent: any) => ({
          value: agent.id,
          label: agent.name || '-',
        })),
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange('assignedToId', value);
          }
        },
      });
    }

    return filterOptions;
  }, [t, user, agents, params, handleParamsChange, statuses]);

  if (!user) {
    return null;
  }

  const hiddenColumns = hasAnyRole(user, ['ADMIN', 'MANAGER', 'SUPER_ADMIN'])
    ? ['id', 'priority']
    : ['id', 'priority', 'assignedTo'];

  return (
    <PageContainer title={t('requests.title')}>
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={requests?.items || []}
        filters={filters}
        totalCount={requests?.total || 0}
        pageIndex={pagination.page - 1}
        pageSize={pagination.limit}
        onPageChange={(page) => handlePaginationChange('page', page + 1)}
        onLimitChange={(limit) => handlePaginationChange('limit', limit)}
        hiddenColumns={hiddenColumns}
        onRefresh={handleRefresh}
        activeSorting={[sorting.field, sorting.order]}
      />
    </PageContainer>
  );
}

// Composant pour les changements de statut en masse
type StatusChangeFormProps = {
  selectedRows: ServiceRequestListItem[];
  onSuccess: () => void;
};

function StatusChangeForm({ selectedRows, onSuccess }: StatusChangeFormProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateStatus } = useRequests();

  const form = useForm<StatusChangeFormData>({
    resolver: zodResolver(statusChangeSchema),
  });

  const onSubmit = async (data: StatusChangeFormData) => {
    setIsSubmitting(true);
    try {
      // Mise à jour en parallèle de toutes les demandes sélectionnées
      await Promise.all(
        selectedRows.map((row) =>
          updateStatus({
            requestId: row.id,
            status: data.status,
          }),
        ),
      );

      toast.success(
        t('common.success.bulk_update_success', {
          count: selectedRows.length,
        }),
      );
      onSuccess();
      setOpen(false);
    } catch (error) {
      toast.error(t('common.errors.save_failed'));
      console.error('Error updating request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" aria-label="Changer le status" className="justify-start">
          Changer le statut
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className={cn('flex flex-col')}>
        <SheetHeader className="text-left border-b pb-4 mb-4">
          <SheetTitle>Changer le statut</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('inputs.status.label')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('inputs.status.placeholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(RequestStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(`inputs.requestStatus.options.${status}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button" onClick={() => form.reset()}>
                  {t('common.actions.cancel')}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                {isSubmitting ? 'Chargement...' : 'Appliquer'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

// Composant pour l'assignation en masse
type AssignToChangeFormProps = {
  selectedRows: ServiceRequestListItem[];
  agents: any[];
  onSuccess: () => void;
};

function AssignToChangeForm({
  selectedRows,
  agents,
  onSuccess,
}: AssignToChangeFormProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { assign } = useRequests();

  const form = useForm<AssignToFormData>({
    resolver: zodResolver(assignToSchema),
  });

  const onSubmit = async (data: AssignToFormData) => {
    setIsSubmitting(true);
    try {
      // Assignation en parallèle de toutes les demandes sélectionnées
      await Promise.all(
        selectedRows.map((row) =>
          assign({
            requestId: row.id,
            agentId: data.assignedToId,
          }),
        ),
      );

      toast.success(
        t('common.success.bulk_update_success', {
          count: selectedRows.length,
        }),
      );
      onSuccess();
      setOpen(false);
    } catch (error) {
      toast.error(t('common.errors.save_failed'));
      console.error('Error assigning requests:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Assigner à un agent"
          className="justify-start"
        >
          Assigner à un agent
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className={cn('flex flex-col')}>
        <SheetHeader className="text-left border-b pb-4 mb-4">
          <SheetTitle>Assigner à un agent</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assignedToId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('inputs.assignedTo.label')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('inputs.assignedTo.placeholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button" onClick={() => form.reset()}>
                  {t('common.actions.cancel')}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                {isSubmitting ? 'Chargement...' : 'Appliquer'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
