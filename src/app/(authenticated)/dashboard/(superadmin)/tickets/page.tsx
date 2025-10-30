'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminFeedbackList, useUpdateFeedbackStatus } from '@/hooks/use-feedback';
import { PageContainer } from '@/components/layouts/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TicketActionSheet } from './_components/ticket-action-sheet';
import { Settings, Star } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { FeedbackStatus, FeedbackCategory } from '@/convex/lib/constants';
import { DataTable } from '@/components/data-table/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';

import type { FilterOption } from '@/components/data-table/data-table-toolbar';
import { useTableSearchParams } from '@/hooks/use-table-search-params';
import { DataTableBulkActions } from '@/components/data-table/data-table-bulk-actions';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type TicketFilters = {
  search?: string;
  status?: string[];
  category?: string[];
  organizationId?: string[];
};

type FeedbackWithRelations = {
  _id: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  rating: number | null;
  email: string | null;
  phoneNumber: string | null;
  _creationTime: number;
  user?: {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
  service?: {
    _id: string;
    name: string;
  };
  request?: {
    _id: string;
    serviceCategory: string;
  };
  organization?: {
    _id: string;
    name: string;
  };
  respondedBy?: {
    _id: string;
    name: string;
  };
};

function adaptSearchParams(searchParams: URLSearchParams): TicketFilters {
  const params = {
    ...(searchParams.get('search') && { search: searchParams.get('search') }),
    ...(searchParams.get('status') && {
      status: searchParams.get('status')?.split(',').filter(Boolean) as
        | FeedbackStatus[]
        | undefined,
    }),
    ...(searchParams.get('category') && {
      category: searchParams.get('category')?.split(',').filter(Boolean) as
        | FeedbackCategory[]
        | undefined,
    }),
    ...(searchParams.get('organizationId') && {
      organizationId: searchParams.get('organizationId')?.split(',').filter(Boolean) as
        | string[]
        | undefined,
    }),
  } as TicketFilters;

  return params;
}

export default function TicketsPage() {
  const t = useTranslations();
  const {
    params,
    pagination,
    sorting,
    handleParamsChange,
    handlePaginationChange,
    handleSortingChange,
  } = useTableSearchParams<FeedbackWithRelations, TicketFilters>(adaptSearchParams);

  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  // Requête pour récupérer la liste des tickets
  const { data: ticketsData, isLoading } = useAdminFeedbackList({
    page: pagination.page,
    limit: pagination.limit,
    status: (params.status?.[0] as any) || undefined,
    category: (params.category?.[0] as any) || undefined,
    organizationId: (params.organizationId?.[0] as any) || undefined,
  });

  // Options pour les filtres
  const statuses = useMemo(
    () =>
      (['pending', 'in_review', 'resolved', 'closed'] as const).map((status) => ({
        value: status,
        label: t(`feedback.admin.tickets.list.status.${status}`),
      })),
    [t],
  );

  const categories = useMemo(
    () =>
      (['bug', 'feature', 'improvement', 'other'] as const).map((category) => ({
        value: category,
        label: t(`inputs.feedback.categories.options.${category}`),
      })),
    [t],
  );

  const columns = useMemo<ColumnDef<FeedbackWithRelations>[]>(
    () => [
      {
        id: 'id',
        header: ({ table }) => (
          <label className="flex items-center gap-2 px-2 cursor-pointer">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
              className="translate-y-[2px]"
            />
            <span>ID</span>
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
              <TooltipTrigger asChild>
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
                    {row.original._id.slice(-8)}
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
        accessorKey: 'subject',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('feedback.admin.tickets.list.columns.subject')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'subject',
                order: direction,
              })
            }
            labels={{ asc: 'A-Z', desc: 'Z-A' }}
          />
        ),
        cell: ({ row }) => (
          <div className="max-w-xs truncate font-medium">{row.original.subject}</div>
        ),
      },
      {
        accessorKey: 'category',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('feedback.admin.tickets.list.columns.category')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'category',
                order: direction,
              })
            }
            labels={{ asc: 'A-Z', desc: 'Z-A' }}
          />
        ),
        cell: ({ row }) => (
          <Badge variant="outline">
            {t(`inputs.feedback.categories.options.${row.original.category}`)}
          </Badge>
        ),
        filterFn: (row, id, value) => {
          return value.includes(row.original.category);
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('feedback.admin.tickets.list.columns.status')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'status',
                order: direction,
              })
            }
            labels={{ asc: 'A-Z', desc: 'Z-A' }}
          />
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          const variant =
            status === 'PENDING'
              ? 'warning'
              : status === 'IN_REVIEW'
                ? 'secondary'
                : status === 'RESOLVED'
                  ? 'default'
                  : 'outline';
          return (
            <Badge variant={variant}>
              {t(`feedback.admin.tickets.list.status.${status.toLowerCase()}`)}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.original.status);
        },
      },
      {
        accessorKey: 'rating',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('feedback.admin.tickets.list.columns.rating')}
          />
        ),
        cell: ({ row }) => {
          const rating = row.original.rating;
          return rating ? (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{rating}/5</span>
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: 'user',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('feedback.admin.tickets.list.columns.user')}
          />
        ),
        cell: ({ row }) => {
          const user = row.original.user;
          const email = row.original.email;
          return (
            <div className="text-sm">
              {user?.name || 'Utilisateur anonyme'}
              <div className="text-xs text-muted-foreground">{user?.email || email}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'organization',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('feedback.admin.tickets.list.columns.organization')}
          />
        ),
        cell: ({ row }) => {
          const organization = row.original.organization;
          return organization ? (
            <Badge variant="outline">{organization.name}</Badge>
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
            title={t('feedback.admin.tickets.list.columns.createdAt')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: '_creationTime',
                order: direction,
              })
            }
            labels={{ asc: 'Ancien', desc: 'Récent' }}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(row.original._creationTime), {
              addSuffix: true,
              locale: fr,
            })}
          </span>
        ),
      },
      {
        id: 'actions',
        header: ({ table }) => (
          <DataTableBulkActions
            table={table}
            actions={[
              {
                component: (
                  <BulkStatusChangeForm
                    selectedRows={table
                      .getFilteredSelectedRowModel()
                      .flatRows.map((row) => row.original)}
                    onSuccess={() => {}}
                  />
                ),
              },
            ]}
          />
        ),
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              setSelectedTicket(row.original._id);
              setShowActionSheet(true);
            }}
            leftIcon={<Settings className="size-icon" />}
          >
            Gérer
          </Button>
        ),
      },
    ],
    [handleSortingChange, t],
  );

  const filters = useMemo<FilterOption<FeedbackWithRelations>[]>(
    () => [
      {
        type: 'search',
        property: 'search',
        label: t('feedback.admin.tickets.list.filters.search'),
        defaultValue: params.search || '',
        onChange: (value) => handleParamsChange('search', value),
      },
      {
        type: 'checkbox',
        property: 'status',
        label: t('feedback.admin.tickets.list.filters.status'),
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
        property: 'category',
        label: t('feedback.admin.tickets.list.filters.category'),
        defaultValue: params.category || [],
        options: categories,
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange('category', value);
          }
        },
      },
    ],
    [t, params, statuses, categories, handleParamsChange],
  );

  return (
    <PageContainer
      title={t('feedback.admin.tickets.title')}
      description={t('feedback.admin.tickets.description')}
    >
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={ticketsData?.items || []}
        filters={filters}
        totalCount={ticketsData?.pagination.total || 0}
        pageIndex={pagination.page - 1}
        pageSize={pagination.limit}
        onPageChange={(page) => handlePaginationChange('page', page + 1)}
        onLimitChange={(limit) => handlePaginationChange('limit', limit)}
        hiddenColumns={['organization']}
        activeSorting={[sorting.field, sorting.order]}
        sticky={[
          { id: 'id', position: 'left' },
          { id: 'actions', position: 'right' },
        ]}
        onRefresh={() => {}}
      />

      {/* Action Sheet */}
      <TicketActionSheet
        ticketId={selectedTicket}
        open={showActionSheet}
        onOpenChange={setShowActionSheet}
        onSuccess={() => {}}
      />
    </PageContainer>
  );
}

// Schéma pour le changement de statut en lot
const bulkStatusChangeSchema = z.object({
  status: z.enum(['pending', 'in_review', 'resolved', 'closed']),
});

type BulkStatusChangeFormData = z.infer<typeof bulkStatusChangeSchema>;

type BulkStatusChangeFormProps = {
  selectedRows: FeedbackWithRelations[];
  onSuccess: () => void;
};

function BulkStatusChangeForm({ selectedRows, onSuccess }: BulkStatusChangeFormProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateStatus } = useUpdateFeedbackStatus();

  const form = useForm<BulkStatusChangeFormData>({
    resolver: zodResolver(bulkStatusChangeSchema),
  });

  const onSubmit = async (data: BulkStatusChangeFormData) => {
    setIsSubmitting(true);
    try {
      if (!selectedRows.length) return;

      const updatePromises = selectedRows.map(async (row) => {
        return updateStatus(
          {
            ticketId: row._id as any,
            status: data.status as any,
          },
          { onError: () => {} },
        );
      });

      await Promise.all(updatePromises);

      toast.success(
        t('feedback.admin.tickets.bulk.statusUpdate.success', {
          count: selectedRows.length,
        }),
      );
      onSuccess();
      setOpen(false);
    } catch (error) {
      toast.error(t('feedback.admin.tickets.bulk.statusUpdate.error'));
      console.error('Error updating ticket statuses:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="justify-start">
          {t('feedback.admin.tickets.bulk.statusUpdate.title')}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="text-left border-b pb-4 mb-4">
          <SheetTitle>{t('feedback.admin.tickets.bulk.statusUpdate.title')}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feedback.admin.tickets.list.columns.status')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('feedback.admin.tickets.list.filters.status')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">
                        {t('feedback.admin.tickets.list.status.pending')}
                      </SelectItem>
                      <SelectItem value="in_review">
                        {t('feedback.admin.tickets.list.status.in_review')}
                      </SelectItem>
                      <SelectItem value="resolved">
                        {t('feedback.admin.tickets.list.status.resolved')}
                      </SelectItem>
                      <SelectItem value="closed">
                        {t('feedback.admin.tickets.list.status.closed')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                {t('feedback.admin.tickets.bulk.actions.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                {isSubmitting
                  ? t('feedback.admin.tickets.bulk.actions.saving')
                  : t('feedback.admin.tickets.bulk.actions.save')}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
