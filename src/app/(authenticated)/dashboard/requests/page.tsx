'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCurrentUser } from '@/actions/user';
import { getOrganizationWithSpecificIncludes } from '@/actions/organizations';
import { getServiceRequests, GetRequestsOptions } from '@/actions/service-requests';
import { tryCatch } from '@/lib/utils';
import CardContainer from '@/components/layouts/card-container';
import { PageContainer } from '@/components/layouts/page-container';
import { hasPermission, hasAnyRole } from '@/lib/permissions/utils';
import { FullServiceRequest, PaginatedServiceRequests } from '@/types/service-request';
import { RequestStatus, ServiceCategory, ServicePriority, User } from '@prisma/client';
import { SessionUser } from '@/types';

// Imports pour le DataTable
import { ColumnDef } from '@tanstack/react-table';
import { FileText, Edit } from 'lucide-react';
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
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { updateServiceRequestStatus } from '@/actions/service-requests';

// Define schema for quick edit form
const quickEditSchema = z.object({
  status: z.nativeEnum(RequestStatus),
  notes: z.string().optional(),
});

type QuickEditFormData = z.infer<typeof quickEditSchema>;

type QuickEditFormProps = {
  request: FullServiceRequest;
  onSuccess: () => void;
};

function QuickEditForm({ request, onSuccess }: QuickEditFormProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuickEditFormData>({
    resolver: zodResolver(quickEditSchema),
    defaultValues: {
      status: request.status,
      notes: '',
    },
  });

  const onSubmit = async (data: QuickEditFormData) => {
    setIsSubmitting(true);
    try {
      await updateServiceRequestStatus(request.id, data.status, data.notes);
      toast.success(t('common.success.saved'));
      onSuccess();
    } catch (error) {
      toast.error(t('common.errors.save_failed'));
      console.error('Error updating request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('inputs.notes.label')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('inputs.notes.placeholder')}
                  {...field}
                  className="min-h-[100px]"
                />
              </FormControl>
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
          <DialogClose asChild>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.actions.saving') : t('common.actions.save')}
            </Button>
          </DialogClose>
        </div>
      </form>
    </Form>
  );
}

export default function RequestsPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const { formatDate } = useDateLocale();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestsData, setRequestsData] = useState<PaginatedServiceRequests>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });

  // Utiliser le hook useTableParams pour gérer les paramètres de table
  const { handleParamsChange, handlePageChange, handleLimitChange } = useTableParams();

  // Format query parameters
  const formatQueryParams = useCallback(() => {
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const isAgent = user ? hasAnyRole(user, ['AGENT']) : false;

    // Convertir les chaînes en tableaux pour ces propriétés
    const statusArray = queryParams.status?.split(',') || [];
    const priorityArray = queryParams.priority?.split(',') || [];
    const serviceCategoryArray = queryParams.serviceCategory?.split(',') || [];

    return {
      ...queryParams,
      status: statusArray.length > 0 ? (statusArray as RequestStatus[]) : undefined,
      priority:
        priorityArray.length > 0 ? (priorityArray as ServicePriority[]) : undefined,
      serviceCategory:
        serviceCategoryArray.length > 0
          ? (serviceCategoryArray as ServiceCategory[])
          : undefined,
      page: Number(queryParams.page || '1'),
      limit: Number(queryParams.limit || '10'),
      sortBy: queryParams.sortBy || 'createdAt',
      sortOrder: queryParams.sortOrder as 'asc' | 'desc',
      startDate: queryParams.startDate ? new Date(queryParams.startDate) : undefined,
      endDate: queryParams.endDate ? new Date(queryParams.endDate) : undefined,
      organizationId: queryParams.organizationId ?? user?.organizationId ?? undefined,
      assignedToId: isAgent ? user?.id : undefined,
    } as GetRequestsOptions;
  }, [searchParams, user]);

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
      const formattedParams = formatQueryParams();

      try {
        const result = await tryCatch(getServiceRequests(formattedParams));
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
  }, [user, formatQueryParams]);

  // Refresh data fonction
  const handleRefresh = useCallback(() => {
    const formattedParams = formatQueryParams();
    setIsLoading(true);
    getServiceRequests(formattedParams)
      .then((data) => {
        setRequestsData(data);
      })
      .catch((error) => {
        console.error('Error refreshing data:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [formatQueryParams]);

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
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Photo d'identité" />
        ),
        cell: ({ row }) => {
          const url = row.original.requestedFor?.identityPicture?.fileUrl as string;
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
        accessorKey: 'firstName',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('inputs.firstName.label')} />
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
          <DataTableColumnHeader column={column} title={t('inputs.lastName.label')} />
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
          />
        ),
        cell: ({ row }) => {
          const date = row.original.createdAt;
          return date ? formatDate(date, 'dd/MM/yyyy') : '-';
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('inputs.status.label')} />
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
          <DataTableColumnHeader column={column} title={t('inputs.priority.label')} />
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
      cell: ({ row }) => (
        <DataTableRowActions
          actions={[
            {
              component: (
                <Link
                  onClick={(e) => e.stopPropagation()}
                  href={ROUTES.dashboard.service_requests(row.original.id)}
                >
                  <FileText className="size-icon" />
                  {t('common.actions.consult')}
                </Link>
              ),
            },
            {
              component: (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start">
                      <Edit className="size-icon" />
                      <span>{t('common.actions.edit')}</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t('common.actions.edit')}</DialogTitle>
                    </DialogHeader>
                    <QuickEditForm request={row.original} onSuccess={handleRefresh} />
                  </DialogContent>
                </Dialog>
              ),
            },
          ]}
          row={row}
        />
      ),
    });

    return tableColumns;
  }, [t, user, formatDate, statuses, handleRefresh]);

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
            pageIndex={requestsData.page}
            pageSize={Number(requestsData.limit || 10)}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            hiddenColumns={['id', 'priority', 'assignedTo']}
            onRefresh={handleRefresh}
          />
        </CardContainer>
      )}
    </PageContainer>
  );
}
