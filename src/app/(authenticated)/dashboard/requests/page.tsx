'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import {
  useRequests,
  useUpdateRequestStatus,
  useAssignRequest,
  type RequestFilters,
} from '@/hooks/use-requests';
import { cn, useDateLocale } from '@/lib/utils';
import { PageContainer } from '@/components/layouts/page-container';
import { hasAnyRole } from '@/lib/permissions/utils';
import {
  RequestPriority,
  RequestStatus,
  ServiceCategory,
  ServicePriority,
  UserRole,
} from '@/convex/lib/constants';

// Imports pour le DataTable
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, FileText } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import type { FilterOption } from '@/components/data-table/data-table-toolbar';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button, buttonVariants } from '@/components/ui/button';
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
import { useCurrentUser } from '@/hooks/use-current-user';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ProfileLookupSheet } from '@/components/profile/profile-lookup-sheet';
import type { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';

// Types pour les agents
type Agent = {
  _id: Id<'memberships'>;
  firstName?: string;
  lastName?: string;
  email?: string;
};

// Type pour les demandes enrichies
type RequestListItem = {
  _id: Id<'requests'>;
  profileId?: Id<'profiles'> | Id<'childProfiles'>;
  profileFirstName?: string;
  profileLastName?: string;
  profileEmail?: string;
  profilePhoneNumber?: string;
  status: string;
  priority: string;
  submittedAt?: number;
  serviceCategory?: string;
  assigneeFullName?: string;
  assigneeMembershipId?: Id<'memberships'>;
  requesterFullName?: string;
  countryCode?: string;
  organizationName?: string;
  organizationType?: string;
  organizationId?: Id<'organizations'>;
};

// Function to adapt search parameters for service requests
function adaptSearchParams(searchParams: URLSearchParams): RequestFilters {
  return {
    status: searchParams.get('status')?.split(',').filter(Boolean) as
      | RequestStatus[]
      | undefined,
    priority: searchParams.get('priority')?.split(',').filter(Boolean) as
      | RequestPriority[]
      | undefined,
    serviceCategory: searchParams.get('serviceCategory')?.split(',').filter(Boolean) as
      | ServiceCategory[]
      | undefined,
    organizationId: searchParams.get('organizationId')?.split(',').filter(Boolean) as
      | Id<'organizations'>[]
      | undefined,
    assignedToId: searchParams.get('assignedToId')?.split(',').filter(Boolean) as
      | Id<'memberships'>[]
      | undefined,
    search: searchParams.get('search') || undefined,
  };
}

// Schema pour les changements de statut en masse
const statusChangeSchema = z.object({
  status: z.string(),
});

type StatusChangeFormData = z.infer<typeof statusChangeSchema>;

// Schema pour l'assignation en masse
const assignToSchema = z.object({
  assignedToId: z.string().min(1, 'Agent requis'),
});

type AssignToFormData = z.infer<typeof assignToSchema>;

export default function RequestsPageClient() {
  const { user } = useCurrentUser();
  const router = useRouter();

  const {
    params,
    pagination,
    sorting,
    handleParamsChange,
    handleSortingChange,
    handlePaginationChange,
  } = useTableSearchParams<RequestListItem, RequestFilters>(adaptSearchParams);

  const t = useTranslations();

  const { formatDate } = useDateLocale();

  const { requests, total, isLoading } = useRequests({
    ...params,
    page: pagination.page,
    limit: pagination.limit,
    sortBy: sorting.field,
    sortOrder: sorting.order,
  });

  const agents: Agent[] = [];

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
  const columns = useMemo<ColumnDef<RequestListItem>[]>(() => {
    const tableColumns: ColumnDef<RequestListItem>[] = [
      {
        id: 'id',
        header: ({ table }) => (
          <label className="px-2 cursor-pointer">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
              className="translate-y-[2px]"
            />
          </label>
        ),
        cell: ({ row }) => (
          <label className="flex items-center gap-2 px-2 cursor-pointer">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="translate-y-[2px]"
            />

            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0"
                  onClick={() => {
                    navigator.clipboard.writeText(row.original._id);
                    toast.success('ID copié dans le presse-papiers');
                  }}
                >
                  <span className="uppercase text-muted-foreground">
                    {row.original._id.slice(0, 6)}...
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span className="uppercase">{row.original._id}</span> (cliquez pour
                copier)
              </TooltipContent>
            </Tooltip>
          </label>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'requesterFullName',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('requests.table.requester')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'requesterFullName' as keyof RequestListItem,
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
                {row.original.requesterFullName || '-'}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'profileEmail',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('inputs.email.label')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'profileEmail' as keyof RequestListItem,
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
                {row.original.profileEmail || '-'}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'submittedAt',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('requests.table.submitted_at')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'submittedAt' as keyof RequestListItem,
                order: direction,
              })
            }
          />
        ),
        cell: ({ row }) => {
          const date = row.original.submittedAt;
          return date ? formatDate(new Date(date), 'dd/MM/yyyy') : '-';
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
                field: 'serviceCategory' as keyof RequestListItem,
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
          const category = row.original.serviceCategory;
          return (
            <div className="flex items-center">
              <Badge variant={'outline'}>
                {category ? t(`inputs.serviceCategory.options.${category}`) : '-'}
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
                variant={
                  row.original.priority === RequestPriority.Urgent
                    ? 'destructive'
                    : 'outline'
                }
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
    const isAdmin = user
      ? hasAnyRole(user, [UserRole.Admin, UserRole.Manager, UserRole.SuperAdmin])
      : false;
    if (isAdmin) {
      tableColumns.push({
        accessorKey: 'assigneeFullName',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('requests.table.assigned_to')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'assigneeFullName' as keyof RequestListItem,
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
          const assigneeFullName = row.original.assigneeFullName;
          return assigneeFullName || '-';
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
                    router.refresh();
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
                  agents={agents}
                  onSuccess={() => {
                    router.refresh();
                  }}
                />
              ),
            },
          ]}
        />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={
                  buttonVariants({ variant: 'ghost', size: 'icon' }) +
                  ' aspect-square p-0'
                }
                href={ROUTES.dashboard.service_requests(row.original._id)}
              >
                <FileText className="size-icon" />
                <span className="sr-only">{t('common.actions.consult')}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <span>{t('common.actions.consult')}</span>
            </TooltipContent>
          </Tooltip>

          <ProfileLookupSheet
            profileId={row.original.profileId as Id<'profiles'>}
            icon={<Eye className="size-icon" />}
            tooltipContent="Aperçu du profil"
          />
        </div>
      ),
    });

    return tableColumns;
  }, [t, user, formatDate, statuses, handleSortingChange, agents]);

  // Définition des filtres
  const filters = useMemo<FilterOption<RequestListItem>[]>(() => {
    const isAdmin = user
      ? hasAnyRole(user, [UserRole.Admin, UserRole.Manager, UserRole.SuperAdmin])
      : false;

    const filterOptions: FilterOption<RequestListItem>[] = [
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
            handleParamsChange('serviceCategory', value as ServiceCategory[]);
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
            handleParamsChange('status', value as RequestStatus[]);
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
            handleParamsChange('priority', value as RequestPriority[]);
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
        options: agents.map((agent) => ({
          value: agent._id,
          label: agent.firstName + ' ' + agent.lastName || '-',
        })),
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange('assignedToId', value as Id<'memberships'>[]);
          }
        },
      });
    }

    return filterOptions;
  }, [t, user, agents, params, handleParamsChange, statuses]);

  if (!user) {
    return null;
  }

  const hiddenColumns = hasAnyRole(user, [
    UserRole.Admin,
    UserRole.Manager,
    UserRole.SuperAdmin,
  ])
    ? ['priority']
    : ['priority', 'assignedTo'];

  return (
    <PageContainer title={t('requests.title')}>
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={requests || []}
        filters={filters}
        totalCount={total || 0}
        pageIndex={pagination.page - 1}
        pageSize={pagination.limit}
        onPageChange={(page) => handlePaginationChange('page', page + 1)}
        onLimitChange={(limit) => handlePaginationChange('limit', limit)}
        hiddenColumns={hiddenColumns}
        onRefresh={() => {}}
        activeSorting={[sorting.field, sorting.order]}
        sticky={[
          {
            id: 'actions',
            position: 'right',
          },
          {
            id: 'select',
            position: 'left',
          },
        ]}
      />
    </PageContainer>
  );
}

// Composant pour les changements de statut en masse
type StatusChangeFormProps = {
  selectedRows: RequestListItem[];
  onSuccess: () => void;
};

function StatusChangeForm({ selectedRows, onSuccess }: StatusChangeFormProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateStatus } = useUpdateRequestStatus();

  const form = useForm<StatusChangeFormData>({
    resolver: zodResolver(statusChangeSchema),
  });

  const onSubmit = async (data: StatusChangeFormData) => {
    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedRows.map((row) => updateStatus(row._id, data.status as RequestStatus)),
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
  selectedRows: RequestListItem[];
  agents: Agent[];
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
  const { assignRequest } = useAssignRequest();

  const form = useForm<AssignToFormData>({
    resolver: zodResolver(assignToSchema),
  });

  const onSubmit = async (data: AssignToFormData) => {
    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedRows.map((row) =>
          assignRequest(row._id, data.assignedToId as Id<'memberships'>),
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
                        <SelectItem key={agent._id} value={agent._id}>
                          {agent.firstName} {agent.lastName}
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
