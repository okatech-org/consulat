'use client';

import { useTranslations } from 'next-intl';
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCurrentUser } from '@/actions/user';
import { getOrganizationWithSpecificIncludes } from '@/actions/organizations';
import { getServiceRequests, GetRequestsOptions } from '@/actions/service-requests';
import { cn, tryCatch } from '@/lib/utils';
import CardContainer from '@/components/layouts/card-container';
import { PageContainer } from '@/components/layouts/page-container';
import { hasPermission, hasAnyRole } from '@/lib/permissions/utils';
import { FullServiceRequest, PaginatedServiceRequests } from '@/types/service-request';
import { RequestStatus, ServiceCategory, ServicePriority, User } from '@prisma/client';
import { SessionUser } from '@/types';

// Imports pour le DataTable
import { ColumnDef } from '@tanstack/react-table';
import { FileText } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { useDateLocale } from '@/lib/utils';
import { FilterOption } from '@/components/data-table/data-table-toolbar';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// Imports des nouveaux hooks et utilitaires
import { useTableParams } from '@/components/utils/table-hooks';
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
import { toast } from '@/hooks/use-toast';
import { updateServiceRequestStatus } from '@/actions/service-requests';
import { updateConsularRegistrationStatus } from '@/actions/consular-registration';
import { DataTableBulkActions } from '@/components/data-table/data-table-bulk-actions';
import {
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Sheet,
} from '@/components/ui/sheet';
import { assignRequestToAgent } from '@/actions/agents';
import { useRouter } from 'next/navigation';

// Function to adapt search parameters for service requests
function adaptServiceRequestSearchParams(
  searchParams: ReadonlyURLSearchParams,
  user: SessionUser | null,
): GetRequestsOptions {
  const sortParam = searchParams.get('sort');
  const sortBy = sortParam?.split('-')[0];
  const sortOrder = sortParam?.split('-')[1] as 'asc' | 'desc';

  const isAgent = user ? hasAnyRole(user, ['AGENT']) : false;

  // Get page parameter and ensure it's a valid number (1-based for URLs)
  const page = Math.max(1, Number(searchParams.get('page') || '1'));

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
    page: page,
    limit: Math.max(1, Number(searchParams.get('limit') || '10')),
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'desc',
    search: searchParams.get('search') || undefined,
    startDate: searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined,
    endDate: searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined,
    organizationId:
      searchParams.get('organizationId') ?? user?.organizationId ?? undefined,
    assignedToId: isAgent ? user?.id : searchParams.get('assignedToId') || undefined,
  };
}

export default function RequestsPage() {
  const router = useRouter();
  const t = useTranslations();
  const searchParams = useSearchParams();
  const { formatDate } = useDateLocale();
  const [user, setUser] = useState<SessionUser | null>(null);
  const formattedQueryParams = useMemo(
    () => adaptServiceRequestSearchParams(searchParams, user),
    [searchParams, user],
  );
  const [agents, setAgents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestsData, setRequestsData] = useState<PaginatedServiceRequests>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });

  // Utiliser le hook useTableParams pour gérer les paramètres de table
  const { handleParamsChange, handlePageChange, handleLimitChange, handleSortChange } =
    useTableParams();

  // Load user data
  useEffect(() => {
    async function loadUserData() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    loadUserData();
  }, []);

  // Load organization data if user is admin
  useEffect(() => {
    async function loadOrganizationData() {
      if (user && hasAnyRole(user, ['ADMIN']) && user.organizationId) {
        const result = await tryCatch(
          getOrganizationWithSpecificIncludes(user.organizationId, ['agents']),
        );
        if (result.data && result.data.agents) {
          setAgents(result.data.agents as unknown as User[]);
        }
      }
    }

    if (user) {
      loadOrganizationData();
    }
  }, [user]);

  // Fetch requests data
  useEffect(() => {
    async function fetchRequestsData() {
      if (!user) return;

      setIsLoading(true);

      try {
        const result = await tryCatch(getServiceRequests(formattedQueryParams));
        if (result.data) {
          setRequestsData(result.data);
        } else if (result.error) {
          console.error('Error fetching service requests:', result.error);
        }
      } catch (error) {
        console.error('Error in fetchRequestsData:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRequestsData();
  }, [user, formattedQueryParams]);

  // Refresh data fonction
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    getServiceRequests(formattedQueryParams)
      .then((data) => {
        setRequestsData(data);
      })
      .catch((error) => {
        console.error('Error refreshing data:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [formattedQueryParams]);

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
  const columns = useMemo<ColumnDef<PaginatedServiceRequests['items'][number]>[]>(() => {
    const tableColumns: ColumnDef<PaginatedServiceRequests['items'][number]>[] = [
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
            sortHandler={(direction) => handleSortChange('firstName', direction)}
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
            sortHandler={(direction) => handleSortChange('lastName', direction)}
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
            sortHandler={(direction) => handleSortChange('createdAt', direction)}
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
            sortHandler={(direction) => handleSortChange('status', direction)}
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
            sortHandler={(direction) => handleSortChange('serviceCategory', direction)}
            labels={{
              asc: 'A-Z',
              desc: 'Z-A',
            }}
          />
        ),
        cell: ({ row }) => {
          const serviceCategory = Object.values(ServiceCategory).find(
            (serviceCategory) => serviceCategory === row.getValue('serviceCategory'),
          );

          if (!serviceCategory) {
            return null;
          }

          return (
            <div className="flex items-center">
              <Badge variant={'outline'}>
                {t(`inputs.serviceCategory.options.${serviceCategory}`)}
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
            sortHandler={(direction) => handleSortChange('priority', direction)}
            labels={{
              asc: 'A-Z',
              desc: 'Z-A',
            }}
          />
        ),
        cell: ({ row }) => {
          const priority = Object.values(ServicePriority).find(
            (priority) => priority === row.getValue('priority'),
          );

          if (!priority) {
            return null;
          }

          return (
            <div className="flex items-center">
              <Badge variant={priority === 'URGENT' ? 'destructive' : 'outline'}>
                {/* @ts-expect-error - translations are in lowercase */}
                {t('inputs.priority.options.' + priority)}
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
        accessorKey: 'assignedTo',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('requests.table.assigned_to')}
            sortHandler={(direction) => handleSortChange('assignedToId', direction)}
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
        <Button variant="outline" size="sm" className="min-w-max" asChild>
          <Link
            onClick={(e) => e.stopPropagation()}
            href={ROUTES.dashboard.service_requests(row.original.id)}
          >
            <FileText className="size-icon" />
            {t('common.actions.consult')}
          </Link>
        </Button>
      ),
    });

    return tableColumns;
  }, [t, user, formatDate, statuses, handleSortChange, agents, router]);

  // Définition des filtres
  const filters = useMemo<FilterOption<FullServiceRequest>[]>(() => {
    const isAdmin = user ? hasAnyRole(user, ['ADMIN', 'MANAGER', 'SUPER_ADMIN']) : false;

    // Extraire directement des searchParams pour les filtres
    const status = searchParams.get('status')?.split(',') || [];
    const priority = searchParams.get('priority')?.split(',') || [];
    const serviceCategory = searchParams.get('serviceCategory')?.split(',') || [];

    const filterOptions: FilterOption<FullServiceRequest>[] = [
      {
        type: 'search',
        label: t('requests.filters.search'),
        defaultValue: searchParams.get('search') || '',
        onChange: (value) =>
          handleParamsChange({
            type: 'filter',
            name: 'search',
            value,
          }),
      },
      {
        type: 'checkbox',
        property: 'serviceCategory',
        label: t('requests.filters.service_category'),
        defaultValue: serviceCategory,
        options: Object.values(ServiceCategory).map((category) => ({
          value: category,
          label: t(`inputs.serviceCategory.options.${category}`),
        })),
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange({
              type: 'filter',
              name: 'serviceCategory',
              value: value.join(','),
            });
          }
        },
      },
      {
        type: 'checkbox',
        property: 'status',
        label: t('inputs.status.label'),
        defaultValue: status,
        options: statuses,
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange({
              type: 'filter',
              name: 'status',
              value: value.join(','),
            });
          }
        },
      },
      {
        type: 'checkbox',
        property: 'priority',
        label: t('requests.filters.priority'),
        defaultValue: priority,
        options: Object.values(ServicePriority).map((priority) => ({
          value: priority,
          label: t(`common.priority.${priority}`),
        })),
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange({
              type: 'filter',
              name: 'priority',
              value: value.join(','),
            });
          }
        },
      },
    ];

    // Ajouter le filtre assignedTo si l'utilisateur est admin
    if (isAdmin && agents.length > 0) {
      const assignedToId = searchParams.get('assignedToId')?.split(',') || [];

      filterOptions.push({
        type: 'checkbox',
        property: 'assignedTo',
        label: t('requests.filters.assigned_to'),
        defaultValue: assignedToId,
        options: agents.map((agent) => ({
          value: agent.id,
          label: agent.name || '-',
        })),
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange({
              type: 'filter',
              name: 'assignedToId',
              value: value.join(','),
            });
          }
        },
      });
    }

    return filterOptions;
  }, [t, user, agents, searchParams, handleParamsChange, statuses]);

  if (!user) {
    return null;
  }

  const hiddenColumns = hasAnyRole(user, ['ADMIN', 'MANAGER', 'SUPER_ADMIN'])
    ? ['id', 'priority']
    : ['id', 'priority', 'assignedTo'];

  return (
    <PageContainer title={t('requests.title')}>
      {user && hasPermission(user, 'serviceRequests', 'list') && (
        <CardContainer>
          <DataTable
            isLoading={isLoading}
            columns={columns}
            data={requestsData.items}
            filters={filters}
            totalCount={requestsData.total}
            pageIndex={requestsData.page - 1}
            pageSize={Number(requestsData.limit || 10)}
            onPageChange={(page) => handlePageChange(page + 1)}
            onLimitChange={handleLimitChange}
            hiddenColumns={hiddenColumns}
            onRefresh={handleRefresh}
            activeSorting={
              formattedQueryParams.sortBy && formattedQueryParams.sortOrder
                ? [
                    formattedQueryParams.sortBy as keyof FullServiceRequest,
                    formattedQueryParams.sortOrder,
                  ]
                : undefined
            }
          />
        </CardContainer>
      )}
    </PageContainer>
  );
}

const statusChangeSchema = z.object({
  status: z.nativeEnum(RequestStatus),
});

type StatusChangeFormData = z.infer<typeof statusChangeSchema>;

type StatusChangeFormProps = {
  selectedRows: FullServiceRequest[];
  onSuccess: () => void;
};

function StatusChangeForm({ selectedRows, onSuccess }: StatusChangeFormProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StatusChangeFormData>({
    resolver: zodResolver(statusChangeSchema),
  });

  const onSubmit = async (data: StatusChangeFormData) => {
    setIsSubmitting(true);
    try {
      await handleBulkStatusUpdate(selectedRows, data.status);

      toast({
        title: t('common.success.bulk_update_success', {
          count: selectedRows.length,
        }),
        variant: 'success',
      });
      onSuccess();
      setOpen(false);
    } catch (error) {
      toast({
        title: t('common.errors.save_failed'),
        variant: 'destructive',
      });
      console.error('Error updating request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkStatusUpdate = async (
    selectedRows: FullServiceRequest[],
    status: RequestStatus,
  ) => {
    if (!selectedRows.length) return;

    const updatePromises = selectedRows.map(async (row) => {
      if (row?.requestedFor?.id) {
        return updateConsularRegistrationStatus(row.id, row.requestedFor.id, status);
      }
      return updateServiceRequestStatus(row.id, status);
    });

    await Promise.all(updatePromises);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" aria-label="Changer le status" className="justify-start">
          Changer le status
        </Button>
      </SheetTrigger>
      <SheetContent side="right" size="sm" className={cn('flex flex-col')}>
        <SheetHeader className="text-left border-b pb-4 mb-4">
          <SheetTitle>Changer le status</SheetTitle>
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

const assignToChangeSchema = z.object({
  assignedToId: z.string(),
});

type AssignToChangeFormData = z.infer<typeof assignToChangeSchema>;

type AssignToChangeFormProps = {
  selectedRows: FullServiceRequest[];
  agents: User[];
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

  const form = useForm<AssignToChangeFormData>({
    resolver: zodResolver(assignToChangeSchema),
  });

  const onSubmit = async (data: AssignToChangeFormData) => {
    setIsSubmitting(true);
    try {
      await handleBulkAssignToUpdate(selectedRows, data.assignedToId);

      toast({
        title: t('common.success.bulk_update_success', {
          count: selectedRows.length,
        }),
        variant: 'success',
      });
      onSuccess();
      setOpen(false);
    } catch (error) {
      toast({
        title: t('common.errors.save_failed'),
        variant: 'destructive',
      });
      console.error('Error updating request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkAssignToUpdate = async (
    selectedRows: FullServiceRequest[],
    assignedToId: string,
  ) => {
    if (!selectedRows.length) return;

    const updatePromises = selectedRows.map(async (row) => {
      return assignRequestToAgent(row.id, assignedToId);
    });

    await Promise.all(updatePromises);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" aria-label="Changer le status" className="justify-start">
          Assigner à un agent
        </Button>
      </SheetTrigger>
      <SheetContent side="right" size="sm" className={cn('flex flex-col')}>
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
